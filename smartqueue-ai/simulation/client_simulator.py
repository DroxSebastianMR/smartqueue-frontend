"""Reproducible anonymous clients for the academic queue MVP, not browser/payment users."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path
import random
import threading
import time
import urllib.error
from urllib.parse import urlencode, urlparse

from simulation.load_generator import request_json


def make_trace(seed, count, duration, scenario):
    rng = random.Random(seed)
    rows = []
    for index in range(count):
        arrival = rng.uniform(0, duration)
        if scenario == 'BURST' and index < count * .7:
            arrival = rng.uniform(duration * .3, duration * .4)
        elif scenario == 'SUSTAINED_PEAK':
            arrival = rng.uniform(0, duration * .7)
        rows.append(dict(client=index, arrival=round(arrival, 3), poll=round(rng.uniform(2, 5), 3),
                         patience=round(rng.uniform(20, 60), 3), think=round(rng.uniform(1, 5), 3),
                         checkout=round(rng.uniform(1, 4), 3), quantity=1,
                         abandon=rng.random() < .15, reconnect=rng.random() < .2))
    return sorted(rows, key=lambda row: (row['arrival'], row['client']))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--events', required=True, help='JSON list with isolated event ids and modes')
    parser.add_argument('--output', required=True)
    parser.add_argument('--base-url', default='http://127.0.0.1:3001/api/v1')
    parser.add_argument('--clients', type=int, default=200)
    parser.add_argument('--duration', type=int, default=60)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--scenario', choices=['NORMAL', 'BURST', 'SUSTAINED_PEAK'], default='NORMAL')
    args = parser.parse_args()
    target = urlparse(args.base_url)
    if target.hostname not in ('127.0.0.1', 'localhost') or target.port != 3001:
        parser.error('Only isolated localhost API on 3001 is permitted')
    if not 1 <= args.clients <= 500 or not 30 <= args.duration <= 600:
        parser.error('clients: 1..500; duration: 30..600 seconds')
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    trace = make_trace(args.seed, args.clients, args.duration, args.scenario)
    encoded = json.dumps(trace, sort_keys=True).encode()
    trace_hash = hashlib.sha256(encoded).hexdigest()
    (output / 'trace.json').write_text(encoded.decode(), encoding='utf-8')
    admin = request_json(args.base_url, '/auth/login', '', dict(
        email=os.environ['AUTH_ADMIN_EMAIL'], password=os.environ['AUTH_ADMIN_PASSWORD']))['accessToken']
    customer = request_json(args.base_url, '/auth/login', '', dict(
        email=os.environ.get('AUTH_DEMO_EMAIL', 'demo@cinetrux.test'),
        password=os.environ.get('AUTH_DEMO_PASSWORD', 'CinetruxDemo2026!')))['accessToken']
    tokens = {'admin': admin, 'customer': customer}
    auth_lock = threading.Lock()
    for event in json.loads(Path(args.events).read_text(encoding='utf-8')):
        run = request_json(args.base_url, '/experiments', admin, dict(eventId=event['id'],
            scenario=args.scenario, controlMode=event['mode'], seed=args.seed,
            generatorVersion='clients-v1-' + trace_hash[:12], durationSeconds=args.duration,
            minLimit=2, maxLimit=10, initialLimit=4, purchaseProbability=.85, abandonProbability=.15))
        print(f"RUN {run['id']} {event['mode']} | /monitoring?runId={run['id']}", flush=True)
        started = time.monotonic()
        lock = threading.Lock()
        requests, results = [], []

        def call(path, body=None, method='POST', token=customer, retry_auth=True):
            before = time.monotonic()
            status = 'SUCCESS'
            role = 'admin' if token == admin else 'customer'
            try:
                return request_json(args.base_url, path, tokens[role], body, method)
            except urllib.error.HTTPError as error:
                status = error.code
                if error.code == 401 and retry_auth:
                    with auth_lock:
                        credentials = dict(email=os.environ['AUTH_ADMIN_EMAIL'], password=os.environ['AUTH_ADMIN_PASSWORD']) if role == 'admin' else dict(
                            email=os.environ.get('AUTH_DEMO_EMAIL', 'demo@cinetrux.test'),
                            password=os.environ.get('AUTH_DEMO_PASSWORD', 'CinetruxDemo2026!'))
                        tokens[role] = request_json(args.base_url, '/auth/login', '', credentials)['accessToken']
                    return call(path, body, method, token, retry_auth=False)
                raise
            except OSError:
                status = 0
                raise
            finally:
                with lock:
                    requests.append(dict(operation=path.split('?')[0], status=status,
                                         elapsedMs=round((time.monotonic()-before)*1000, 3)))

        def client(plan):
            participant = f"client-{run['id']}-{plan['client']}"
            body = dict(eventId=event['id'], participantToken=participant)
            result = dict(client=plan['client'], status='ERROR', waitSeconds=None)
            time.sleep(max(0, started + plan['arrival'] - time.monotonic()))
            arrived = time.monotonic()
            result['arrivalDriftSeconds'] = round(arrived-started-plan['arrival'], 3)
            try:
                entry = call('/queue/entries', body)
                result['entryId'] = entry['id']
                if plan['reconnect']:
                    again = call('/queue/entries', body)
                    if again['id'] != entry['id']:
                        raise ValueError('Duplicate entry after reconnection')
                while True:
                    snapshot = call('/queue/events/' + event['id'] + '/status?' + urlencode({'token': participant}), method='GET')
                    state = snapshot['entry']['status']
                    if state in ('EXPIRED', 'CANCELLED', 'COMPLETED'):
                        result['status'] = state
                        break
                    elapsed = time.monotonic() - arrived
                    if elapsed >= plan['patience'] or (plan['abandon'] and elapsed >= plan['think']):
                        result['status'] = call('/queue/entries/cancel', body)['status']
                        break
                    if state == 'ADMITTED':
                        result['waitSeconds'] = round(elapsed, 3)
                        time.sleep(plan['think'])
                        reservation_body = dict(eventId=event['id'], queueEntryId=entry['id'], quantity=plan['quantity'])
                        try:
                            reservation = call('/sales/reservations', reservation_body)
                        except (TimeoutError, urllib.error.URLError):
                            reservation = call('/sales/reservations', reservation_body)
                        time.sleep(plan['checkout'])
                        path = f"/sales/reservations/{reservation['id']}/confirm"
                        try:
                            purchase = call(path, {})
                        except (TimeoutError, urllib.error.URLError):
                            purchase = call(path, {})
                        result.update(status='COMPLETED', purchaseId=purchase['id'])
                        break
                    time.sleep(plan['poll'])
            except Exception as error:
                result['errorType'] = type(error).__name__
                result['httpStatus'] = getattr(error, 'code', None)
                try:
                    call('/queue/entries/cancel', body)
                except Exception:
                    result['cleanupFailed'] = True
            finally:
                result['elapsedSeconds'] = round(time.monotonic()-arrived, 3)
                with lock:
                    results.append(result)

        failure = None
        try:
            with ThreadPoolExecutor(max_workers=args.clients) as pool:
                futures = [pool.submit(client, row) for row in trace]
                next_window = started + 10
                drained_at = None
                while True:
                    time.sleep(max(0, next_window-time.monotonic()))
                    call(f"/admission/runs/{run['id']}/windows/close", {}, token=admin)
                    next_window += 10
                    if all(future.done() for future in futures):
                        if drained_at is None:
                            drained_at = time.monotonic()
                        if time.monotonic()-drained_at >= 30:
                            break
            call(f"/experiments/{run['id']}/finish", {}, method='PATCH', token=admin)
        except Exception as error:
            failure = type(error).__name__
            try:
                call(f"/experiments/{run['id']}/fail", {}, method='PATCH', token=admin)
            except Exception:
                pass
        finally:
            report = dict(runId=run['id'], mode=event['mode'], traceSha256=trace_hash,
                          status='FAILED' if failure else 'COMPLETED', failure=failure,
                          source='MEASURED_HTTP_CLIENTS', clients=results, requests=requests,
                          identity='Anonymous participants; shared demo customer session, separate admin controller')
            (output / f"{event['mode']}-clients.json").write_text(json.dumps(report, indent=2), encoding='utf-8')
            try:
                windows = call(f"/metrics/runs/{run['id']}/windows", method='GET', token=admin)
                (output / f"{event['mode']}-windows.json").write_text(json.dumps(windows, indent=2), encoding='utf-8')
            except Exception:
                windows = []
            print(json.dumps(dict(mode=event['mode'], clients=len(results),
                  completed=sum(r['status']=='COMPLETED' for r in results),
                  cancelled=sum(r['status']=='CANCELLED' for r in results),
                  errors=sum(r['status']=='ERROR' for r in results), windows=len(windows))), flush=True)
        if failure:
            raise SystemExit('Run failed; evidence preserved')


if __name__ == '__main__':
    main()
