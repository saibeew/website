# Private trading worker protocol

The public web application only queues deployment and backtest requests. A private Windows worker owns MetaTrader installation, broker connectivity, Expert Advisor files, execution safeguards, and result reporting.

## Authentication

Set the same randomly generated secret (minimum 32 characters) as `TRADING_WORKER_API_KEY` in the web host and worker secret stores. Send it on every worker request:

```http
Authorization: Bearer <TRADING_WORKER_API_KEY>
```

Do not expose the worker or its secret to browsers. Rotate the key through both secret stores when a worker operator changes or compromise is suspected.

## Claim one job

Poll one queue at a time. Claims are atomic and concurrent workers will not receive the same queued job.

```http
GET https://beew.ai/api/internal/worker/jobs?kind=deployment&workerId=worker-01
GET https://beew.ai/api/internal/worker/jobs?kind=backtest&workerId=worker-01
```

The response is `{ "job": null }` when no work exists. A deployment claim moves `pending` to `processing`; a backtest claim moves `queued` to `processing`.

## Report a deployment result

```json
{
  "kind": "deployment",
  "jobId": "<uuid>",
  "workerId": "worker-01",
  "status": "running",
  "result": { "terminal": "MT5", "brokerOrderId": "optional" }
}
```

Allowed deployment statuses are `running`, `failed`, and `halted`.

## Report a backtest result

```json
{
  "kind": "backtest",
  "jobId": "<uuid>",
  "workerId": "worker-01",
  "status": "completed",
  "reportUrl": "https://private-object-store.example/report",
  "result": { "netProfit": 0, "maxDrawdown": 0 }
}
```

Allowed backtest statuses are `completed` and `failed`. Result updates are accepted only from the worker that claimed the job and are written to the security audit log.

## Required worker safeguards before launch

- Use demo broker accounts for acceptance testing and keep live credentials out of the web application.
- Allowlist EA files and symbols; validate symbol suffixes, lot size, leverage, market hours, and account currency.
- Enforce emergency stop, maximum exposure/drawdown, duplicate-order protection, and stale-price rejection locally before sending an order.
- Use private durable object storage for EA uploads and reports, with malware scanning, encryption, short-lived URLs, and retention rules.
- Alert on claim failures, jobs stuck in `processing`, rejected result updates, terminal disconnects, and broker rejections.
- Record terminal build, broker acknowledgement, order IDs, and failure details in `result` without including secrets.
