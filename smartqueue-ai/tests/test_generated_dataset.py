import pandas as pd

from simulation.generate_dataset import simulate
from training.label_windows import label_windows


def test_reproducibility_and_fifo():
    rows, people = simulate(42, 'BURST', 200)
    assert rows == simulate(42, 'BURST', 200)[0]
    served = [person for person in people if not person['censored']]
    assert [p['participant_id'] for p in served] == sorted(p['participant_id'] for p in served)
    assert all(p['wait_seconds'] >= 0 for p in served)
    assert all(p['wait_seconds'] is None for p in people if p['censored'])
    assert all(row['source'] == 'SYNTHETIC_LOGICAL' for row in rows)


def test_incomplete_future_is_never_labeled_healthy():
    rows, _ = simulate(42, 'NORMAL', 100)
    rows[1]['evaluable'] = False
    _, report = label_windows(pd.DataFrame(rows), 1000, .05)
    assert report['exclusions']['FUTURE_NOT_EVALUABLE'] >= 1
