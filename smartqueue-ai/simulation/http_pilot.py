"""Bounded HTTP smoke comparison. Not a saturation benchmark or final A/B/C trial."""
import argparse
import csv
import json
import os
import time
import urllib.error
from pathlib import Path

from simulation.load_generator import request_json


def export_windows(windows, output):
    names = {'arrivalRate': 'arrival_rate', 'arrivalTrend': 'arrival_trend',
             'queueLength': 'queue_length', 'activeBuyers': 'active_buyers',
             'admissionLimit': 'admission_limit', 'latencyP95Ms': 'latency_p95_ms',
             'errorRate': 'error_rate', 'completionRate': 'completion_rate',
             'runId': 'run_id', 'windowEnd': 'window_end', 'evaluable': 'evaluable'}
    rows = [{**{target: w[source] for source, target in names.items()},
             'scenario': w['run']['scenario'], 'seed': w['run']['seed'],
             'source': 'MEASURED_HTTP_PILOT'} for w in windows]
    if rows:
        with output.open('w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--events', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--base-url', default='http://localhost:3000/api/v1')
    args = parser.parse_args()
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    auth = request_json(args.base_url, '/auth/login', '', {
        'email': os.environ['AUTH_ADMIN_EMAIL'], 'password': os.environ['AUTH_ADMIN_PASSWORD']})
    token = auth.get('accessToken') or auth.get('access_token')
    if not token:
        raise ValueError('Login response did not contain access token')
    reports = []
    for event in json.loads(Path(args.events).read_text(encoding='utf-8')):
        mode, event_id = event['mode'], event['id']
        run = request_json(args.base_url, '/experiments', token, {
            'eventId': event_id, 'scenario': 'NORMAL', 'controlMode': mode,
            'seed': 42, 'generatorVersion': 'http-pilot-v1', 'durationSeconds': 60,
            'minLimit': 2, 'maxLimit': 10, 'initialLimit': 4,
            'purchaseProbability': 1, 'abandonProbability': 0})
        report = {'mode': mode, 'eventId': event_id, 'runId': run['id'],
                  'joined': 0, 'purchased': 0, 'failures': [], 'drift_seconds': [],
                  'status': 'RUNNING',
                  'scope': 'SMOKE_NOT_FINAL_EXPERIMENT', 'source': 'MEASURED_HTTP_PILOT'}
        started = time.monotonic()
        try:
            for tick in range(1, 61):
                delay = started + tick - time.monotonic()
                if delay > 0:
                    time.sleep(delay)
                try:
                    request_json(args.base_url, '/queue/entries', token, {
                        'eventId': event_id, 'participantToken': f'pilot-v1-{event_id}-{tick}'})
                    report['joined'] += 1
                except urllib.error.HTTPError as error:
                    report['failures'].append({'operation': 'join', 'status': error.code})
                if tick % 10 == 0:
                    report['drift_seconds'].append(round(time.monotonic()-started-tick, 3))
                    decision = request_json(args.base_url, f"/admission/runs/{run['id']}/windows/close", token, {})
                    for entry_id in decision.get('admission', {}).get('entryIds', []):
                        try:
                            reservation = request_json(args.base_url, '/sales/reservations', token,
                                {'eventId': event_id, 'queueEntryId': entry_id, 'quantity': 1})
                            request_json(args.base_url, f"/sales/reservations/{reservation['id']}/confirm", token, {})
                            report['purchased'] += 1
                        except urllib.error.HTTPError as error:
                            report['failures'].append({'operation': 'purchase', 'status': error.code})
            request_json(args.base_url, f"/experiments/{run['id']}/finish", token, {}, method='PATCH')
            report['status'] = 'COMPLETED'
        except (OSError, ValueError) as error:
            report['status'] = 'FAILED'
            report['failures'].append({'operation': 'run', 'type': type(error).__name__})
            try:
                request_json(args.base_url, f"/experiments/{run['id']}/fail", token, {}, method='PATCH')
            except (OSError, ValueError) as close_error:
                report['failures'].append({'operation': 'mark_failed', 'type': type(close_error).__name__})
        finally:
            windows = []
            try:
                windows = request_json(args.base_url, f"/metrics/runs/{run['id']}/windows", token, method='GET')
            except (OSError, ValueError) as export_error:
                report['failures'].append({'operation': 'export', 'type': type(export_error).__name__})
            (output / f'{mode}.json').write_text(json.dumps({'report': report, 'windows': windows}, indent=2), encoding='utf-8')
            export_windows(windows, output / f'{mode}.csv')
            reports.append(report)
            (output / 'summary.json').write_text(json.dumps(reports, indent=2), encoding='utf-8')
            print(json.dumps(report), flush=True)
        if report['status'] != 'COMPLETED':
            raise SystemExit('Pilot stopped after failure; evidence preserved. Do not use as completed validation.')


if __name__ == '__main__':
    main()
