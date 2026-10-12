import pandas as pd

from training.label_windows import label_windows


def test_future_label_has_no_current_window_leakage():
    rows = []
    for index in range(5):
        rows.append(
            {
                "run_id": "run-a",
                "window_end": f"2026-10-12T10:00:{index * 10:02d}Z",
                "arrival_rate": 1,
                "arrival_trend": 0,
                "queue_length": 1,
                "active_buyers": 1,
                "admission_limit": 2,
                "latency_p95_ms": 2_000 if index == 1 else 100,
                "error_rate": 0,
                "completion_rate": 1,
                "evaluable": True,
            }
        )
    labeled, report = label_windows(pd.DataFrame(rows), 1_000, 0.05)
    assert labeled.iloc[0].saturation_label == 1
    assert labeled.iloc[1].saturation_label == 0
    assert report["exclusions"]["INCOMPLETE_FUTURE_HORIZON"] == 3
