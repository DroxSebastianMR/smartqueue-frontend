import pandas as pd
import json
import pytest

from simulation.http_pilot import export_windows
from simulation import http_pilot


def test_http_export_keeps_observed_provenance_and_contract(tmp_path):
    window = {'arrivalRate': 1, 'arrivalTrend': 0, 'queueLength': 2,
              'activeBuyers': 3, 'admissionLimit': 4, 'latencyP95Ms': 100,
              'errorRate': 0, 'completionRate': .1, 'runId': 'run-a',
              'windowEnd': '2026-10-19T10:00:00Z', 'evaluable': True,
              'run': {'scenario': 'NORMAL', 'seed': 42}}
    path = tmp_path / 'windows.csv'
    export_windows([window], path)
    data = pd.read_csv(path)
    assert data.iloc[0]['source'] == 'MEASURED_HTTP_PILOT'
    assert data.iloc[0]['latency_p95_ms'] == 100
    assert 'prediction' not in data


def test_timeout_preserves_failure_even_when_metrics_export_fails(tmp_path, monkeypatch):
    events = tmp_path / 'events.json'
    events.write_text(json.dumps([{'id': 'event', 'mode': 'FIXED'}]), encoding='utf-8')
    output = tmp_path / 'evidence'
    monkeypatch.setattr('sys.argv', ['pilot', '--events', str(events), '--output', str(output)])
    monkeypatch.setenv('AUTH_ADMIN_EMAIL', 'local-test')
    monkeypatch.setenv('AUTH_ADMIN_PASSWORD', 'local-test')
    monkeypatch.setattr(http_pilot.time, 'sleep', lambda _: None)
    calls = []

    def request(base, path, token, body=None, method='POST'):
        calls.append(path)
        if path == '/auth/login':
            return {'accessToken': 'test-token'}
        if path == '/experiments':
            return {'id': 'run'}
        if path == '/experiments/run/fail':
            return {'status': 'FAILED'}
        raise TimeoutError('simulated timeout')

    monkeypatch.setattr(http_pilot, 'request_json', request)
    with pytest.raises(SystemExit, match='evidence preserved'):
        http_pilot.main()
    report = json.loads((output / 'FIXED.json').read_text(encoding='utf-8'))
    assert report['report']['status'] == 'FAILED'
    assert report['windows'] == []
    assert [failure['operation'] for failure in report['report']['failures']] == ['run', 'export']
    assert '/experiments/run/fail' in calls
    assert '/experiments/run/finish' not in calls
    assert (output / 'summary.json').exists()
