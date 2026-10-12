import pandas as pd

from training.train import grouped_split


def test_grouped_split_never_leaks_run_ids():
    frame = pd.DataFrame(
        [
            {"run_id": f"run-{run}", "value": row}
            for run in range(12)
            for row in range(4)
        ]
    )
    train, validation, test = grouped_split(frame)
    assert set(train.run_id).isdisjoint(validation.run_id)
    assert set(train.run_id).isdisjoint(test.run_id)
    assert set(validation.run_id).isdisjoint(test.run_id)
