from simulation.client_simulator import make_trace


def test_identical_trace_for_all_controllers():
    first = make_trace(42, 200, 60, 'NORMAL')
    assert first == make_trace(42, 200, 60, 'NORMAL')
    assert first != make_trace(43, 200, 60, 'NORMAL')
    assert len({row['client'] for row in first}) == 200
    assert any(row['abandon'] for row in first)
    assert any(row['reconnect'] for row in first)
    assert all(2 <= row['poll'] <= 5 for row in first)


def test_burst_is_bounded_and_concentrated():
    trace = make_trace(42, 200, 60, 'BURST')
    assert all(0 <= row['arrival'] <= 60 for row in trace)
    assert sum(18 <= row['arrival'] <= 24 for row in trace) >= 140
    assert trace == sorted(trace, key=lambda row: (row['arrival'], row['client']))
