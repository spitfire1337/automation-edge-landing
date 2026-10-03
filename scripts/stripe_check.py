#!/usr/bin/env python3
"""Read-only Stripe balance/activity check.

Reads STRIPE_API_KEY from the environment (never logged or printed) and
fetches the most recent charges and checkout sessions, printing only a
minimal, non-PII summary (id/amount/currency/status/created) to stdout and
to scripts/last_stripe_check.json.
"""
import json
import os
import sys
from datetime import datetime, timezone

try:
    import requests

    def _get(url, auth):
        resp = requests.get(url, auth=auth, timeout=15)
        resp.raise_for_status()
        return resp.json()
except ImportError:  # fall back to urllib if requests isn't installed
    import base64
    import urllib.request

    def _get(url, auth):
        key = auth[0]
        token = base64.b64encode(f"{key}:".encode()).decode()
        req = urllib.request.Request(url, headers={"Authorization": f"Basic {token}"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())


def summarize_charges(data):
    items = data.get("data", [])
    return [
        {
            "id": c.get("id"),
            "amount": c.get("amount"),
            "currency": c.get("currency"),
            "status": c.get("status"),
            "created": c.get("created"),
        }
        for c in items
    ]


def summarize_sessions(data):
    items = data.get("data", [])
    return [
        {
            "id": s.get("id"),
            "amount_total": s.get("amount_total"),
            "currency": s.get("currency"),
            "status": s.get("status"),
            "created": s.get("created"),
        }
        for s in items
    ]


def main():
    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        print("Error: STRIPE_API_KEY is not set in the environment.", file=sys.stderr)
        sys.exit(1)

    auth = (api_key, "")

    charges_raw = _get("https://api.stripe.com/v1/charges?limit=10", auth)
    sessions_raw = _get("https://api.stripe.com/v1/checkout/sessions?limit=10", auth)

    charges = summarize_charges(charges_raw)
    sessions = summarize_sessions(sessions_raw)

    summary = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "charges": {
            "total_count": len(charges),
            "items": charges,
        },
        "checkout_sessions": {
            "total_count": len(sessions),
            "items": sessions,
        },
    }

    print(f"Charges returned: {summary['charges']['total_count']}")
    for c in charges:
        print(f"  id={c['id']} amount={c['amount']} currency={c['currency']} status={c['status']} created={c['created']}")

    print(f"Checkout sessions returned: {summary['checkout_sessions']['total_count']}")
    for s in sessions:
        print(f"  id={s['id']} amount_total={s['amount_total']} currency={s['currency']} status={s['status']} created={s['created']}")

    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "last_stripe_check.json")
    with open(out_path, "w") as f:
        json.dump(summary, f, indent=2)


if __name__ == "__main__":
    main()
