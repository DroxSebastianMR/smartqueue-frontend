import argparse
import json
import random
import time
import urllib.error
import urllib.request
import uuid
from concurrent.futures import ThreadPoolExecutor


def request_json(base_url: str, path: str, token: str, body: dict | None = None, method="POST"):
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}{path}",
        data=data,
        method=method,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read())


def arrivals_for(scenario: str, second: int, rng: random.Random) -> int:
    if scenario == "NORMAL":
        mean = 2
    elif scenario == "BURST":
        mean = 12 if 30 <= second % 90 < 45 else 2
    elif scenario == "SUSTAINED_PEAK":
        mean = 8
    else:
        mean = min(10, 1 + second // 30 * 2)
    return max(0, int(round(rng.gauss(mean, max(0.5, mean * 0.15)))))


def join(base_url: str, token: str, event_id: str, participant: str):
    try:
        return request_json(
            base_url,
            "/queue/entries",
            token,
            {"eventId": event_id, "participantToken": participant},
        )
    except (urllib.error.HTTPError, TimeoutError):
        return None


def run(args) -> None:
    rng = random.Random(args.seed)
    experiment = request_json(
        args.base_url,
        "/experiments",
        args.token,
        {
            "eventId": args.event_id,
            "scenario": args.scenario,
            "controlMode": args.mode,
            "seed": args.seed,
            "generatorVersion": "http-generator-v1",
            "durationSeconds": args.duration,
            "minLimit": args.min_limit,
            "maxLimit": args.max_limit,
            "initialLimit": args.initial_limit,
            "purchaseProbability": args.purchase_probability,
            "abandonProbability": args.abandon_probability,
        },
    )
    run_id = experiment["id"]
    print(f"run_id={run_id} scenario={args.scenario} mode={args.mode} seed={args.seed}")
    started = time.monotonic()
    for second in range(args.duration):
        count = arrivals_for(args.scenario, second, rng)
        participants = [
            f"sim-{args.seed}-{second}-{index}-{uuid.uuid4().hex}"
            for index in range(count)
        ]
        with ThreadPoolExecutor(max_workers=max(1, min(count, args.workers))) as pool:
            list(
                pool.map(
                    lambda participant: join(
                        args.base_url, args.token, args.event_id, participant
                    ),
                    participants,
                )
            )
        if (second + 1) % 10 == 0:
            decision = request_json(
                args.base_url,
                f"/admission/runs/{run_id}/windows/close",
                args.token,
                {},
            )
            admitted = decision.get("admission", {}).get("entryIds", [])
            for entry_id in admitted:
                if rng.random() > args.purchase_probability:
                    continue
                try:
                    reservation = request_json(
                        args.base_url,
                        "/sales/reservations",
                        args.token,
                        {"eventId": args.event_id, "queueEntryId": entry_id, "quantity": 1},
                    )
                    request_json(
                        args.base_url,
                        f"/sales/reservations/{reservation['id']}/confirm",
                        args.token,
                        {},
                    )
                except (urllib.error.HTTPError, TimeoutError):
                    pass
        delay = second + 1 - (time.monotonic() - started)
        if delay > 0:
            time.sleep(delay)
    request_json(args.base_url, f"/experiments/{run_id}/finish", args.token, {}, method="PATCH")
    print(f"completed run_id={run_id}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Reproducible SmartQueue HTTP load generator")
    parser.add_argument("--base-url", default="http://localhost:3000/api/v1")
    parser.add_argument("--token", required=True)
    parser.add_argument("--event-id", required=True)
    parser.add_argument(
        "--scenario",
        choices=["NORMAL", "BURST", "SUSTAINED_PEAK", "STEPPED"],
        required=True,
    )
    parser.add_argument("--mode", choices=["FIXED", "REACTIVE", "PREDICTIVE"], required=True)
    parser.add_argument("--seed", type=int, required=True)
    parser.add_argument("--duration", type=int, default=300)
    parser.add_argument("--purchase-probability", type=float, default=0.75)
    parser.add_argument("--abandon-probability", type=float, default=0.05)
    parser.add_argument("--min-limit", type=int, default=2)
    parser.add_argument("--max-limit", type=int, default=30)
    parser.add_argument("--initial-limit", type=int, default=12)
    parser.add_argument("--workers", type=int, default=20)
    run(parser.parse_args())


if __name__ == "__main__":
    main()
