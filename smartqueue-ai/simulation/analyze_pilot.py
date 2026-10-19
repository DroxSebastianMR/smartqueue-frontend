"""Summarize measured pilot windows without claiming statistical superiority."""
import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

from training.label_windows import label_windows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True)
    args = parser.parse_args()
    directory = Path(args.input)
    results, frames = [], []
    for mode in ('FIXED', 'REACTIVE', 'PREDICTIVE'):
        file = directory / f'{mode}.json'
        if not file.exists():
            continue
        payload = json.loads(file.read_text(encoding='utf-8'))
        windows = payload['windows']
        predictions = [w['prediction'] for w in windows if w.get('prediction')]
        total = sum(w['criticalRequestCount'] for w in windows)
        errors = sum(w['technicalErrorCount'] for w in windows)
        results.append({
            **payload['report'], 'window_count': len(windows), 'critical_requests': total,
            'technical_error_rate': errors / total if total else None,
            'window_latency_p95_median_ms': float(np.median([w['latencyP95Ms'] for w in windows if w['evaluable']])) if any(w['evaluable'] for w in windows) else None,
            'fallback_windows': sum(bool(p['fallbackUsed']) for p in predictions),
            'model_versions': sorted({p['modelVersion'] for p in predictions if p.get('modelVersion')}),
            'warning': 'One short sequential pilot per mode; not matched load or significance evidence.',
        })
        csv_file = directory / f'{mode}.csv'
        # Failed or incomplete runs remain in the report, never in training data.
        if payload['report'].get('status') == 'COMPLETED' and csv_file.exists():
            frames.append(pd.read_csv(csv_file))
    if frames:
        data = pd.concat(frames, ignore_index=True)
        data.to_csv(directory / 'measured-windows.csv', index=False)
        labeled, quality = label_windows(data, 1000, .05)
        labeled.to_csv(directory / 'measured-labeled.csv', index=False)
        (directory / 'quality.json').write_text(json.dumps(quality, indent=2, default=str), encoding='utf-8')
    (directory / 'comparison.json').write_text(json.dumps({'scope': 'HTTP_SMOKE_ONLY', 'modes': results}, indent=2), encoding='utf-8')
    print(json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
