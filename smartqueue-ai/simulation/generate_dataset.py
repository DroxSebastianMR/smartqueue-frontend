"""Offline logical simulation, NOT measured HTTP traffic or cinema customer data."""
import argparse
import hashlib
import json
from collections import deque
from datetime import UTC, datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd


def simulate(seed: int, scenario: str, duration: int = 600):
    rng = np.random.default_rng(seed)
    capacity = int(rng.integers(8, 25))
    limit = int(rng.integers(6, 40))
    service_mean = float(rng.uniform(12, 35))
    base_rate = capacity / service_mean * float(rng.uniform(.3, .7))
    waiting, active = deque(), []
    rows, participants = [], []
    arrivals = completions = admitted = 0
    latencies, errors = [], 0
    previous_rate = 0.
    run_id = f'logical-v1-{scenario}-{seed}'
    epoch = datetime(2026, 10, 19, tzinfo=UTC)
    for second in range(duration):
        multiplier = 1.
        if scenario == 'BURST' and 120 <= second % 300 < 180:
            multiplier = 12.
        elif scenario == 'SUSTAINED_PEAK' and second >= 100:
            multiplier = 6.
        elif scenario == 'RAMP':
            multiplier = 1 + second / duration * 9
        count = int(rng.poisson(base_rate * multiplier))
        for _ in range(count):
            item = {'run_id': run_id, 'participant_id': len(participants),
                    'joined_second': second, 'admitted_second': None,
                    'wait_seconds': None, 'censored': True, 'source': 'SYNTHETIC_LOGICAL'}
            participants.append(item)
            waiting.append(item)
        arrivals += count
        # Service durations and response latencies are deliberately simulated.
        done = [end for end in active if end <= second]
        completions += len(done)
        active = [end for end in active if end > second]
        while waiting and len(active) < limit:
            item = waiting.popleft()
            item.update(admitted_second=second, wait_seconds=second-item['joined_second'], censored=False)
            admitted += 1
            overload = max(0., (len(active) + 1) / capacity - 1)
            active.append(second + max(1., rng.lognormal(np.log(service_mean), .35)) * (1 + overload))
        for _ in active:
            overload = max(0., len(active) / capacity - .7)
            latency = max(1., rng.normal(100 + 850 * overload ** 2, 40))
            latencies.append(latency)
            errors += int(rng.random() < min(.5, .002 + max(0., overload - .5) * .15))
        if (second + 1) % 10 == 0:
            rate = arrivals / 10
            rows.append({'run_id': run_id, 'window_end': (epoch + timedelta(seconds=second+1)).isoformat(),
                         'seed': seed, 'scenario': scenario, 'source': 'SYNTHETIC_LOGICAL',
                         'generator_version': 'logical-v1', 'arrival_rate': rate,
                         'arrival_trend': rate - previous_rate, 'queue_length': len(waiting),
                         'active_buyers': len(active), 'admission_limit': limit,
                         'latency_p95_ms': float(np.percentile(latencies, 95)) if latencies else np.nan,
                         'error_rate': errors / len(latencies) if latencies else np.nan,
                         'completion_rate': completions / 10, 'admitted_count': admitted,
                         'evaluable': len(latencies) >= 5, 'sample_count': len(latencies),
                         'simulated_capacity': capacity, 'service_mean_seconds': service_mean})
            previous_rate = rate
            arrivals = completions = admitted = errors = 0
            latencies = []
    return rows, participants


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--runs', type=int, default=60)
    parser.add_argument('--seed', type=int, default=4200)
    parser.add_argument('--duration', type=int, default=600)
    parser.add_argument('--output', default='data/generated/bootstrap-v1')
    args = parser.parse_args()
    if args.runs < 12 or args.duration < 60 or args.duration % 10:
        raise ValueError('Use >=12 runs and duration >=60 divisible by 10')
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    windows, people = [], []
    for index in range(args.runs):
        rows, participants = simulate(args.seed+index, ('NORMAL', 'BURST', 'SUSTAINED_PEAK', 'RAMP')[index % 4], args.duration)
        windows.extend(rows)
        people.extend(participants)
    pd.DataFrame(windows).to_csv(output / 'windows.csv', index=False)
    pd.DataFrame(people).to_csv(output / 'participants.csv', index=False)
    manifest = {**vars(args), 'source': 'SYNTHETIC_LOGICAL', 'version': 'logical-v1',
                'windows': len(windows), 'participants': len(people),
                'limitations': 'No HTTP measurements, no real customers, no operational performance claims.',
                'files': {name: hashlib.sha256((output / name).read_bytes()).hexdigest()
                          for name in ('windows.csv', 'participants.csv')}}
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    main()
