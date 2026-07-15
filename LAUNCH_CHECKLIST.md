# beew.ai production launch checklist

## Automated release gate

- [ ] `npm ci` succeeds from a clean checkout.
- [x] `npm run lint` succeeds with zero warnings (verified 2026-07-15).
- [x] `npx tsc --noEmit` succeeds (verified 2026-07-15).
- [x] `npm test -- --runInBand` succeeds: 5 suites, 13 tests (verified 2026-07-15).
- [x] `npm run build` succeeds (verified 2026-07-15).
- [x] `npm audit --omit=dev --audit-level=high` has no high/critical findings (verified 2026-07-15; two moderate transitive PostCSS findings remain pending a non-breaking upstream Next.js resolution).
- [ ] `GET /api/health` returns HTTP 200 in the production environment.

## Infrastructure

- [ ] PostgreSQL schema initialized with `npm run postgres:init` and migration output retained.
- [ ] Point-in-time recovery, encrypted backups, restore drill, and retention policy verified.
- [ ] Production and staging use separate databases, credentials, AI keys, messaging tokens, and broker accounts.
- [ ] Secrets are stored only in the hosting secret manager and rotation is documented.
- [ ] Application logs, uptime monitoring, error alerting, database alerts, and API-cost alerts are enabled.
- [ ] Rollback to the previous application release and compatible database schema has been rehearsed.
- [ ] Rate limiting is enforced at the CDN/WAF in addition to the application-level limiter.
- [ ] Studio media uses durable private object storage with malware scanning and lifecycle retention before enabling public uploads.

## Trading and data integrity

- [ ] Windows terminal/worker infrastructure is isolated from the public web application and tested with demo broker accounts.
- [x] Public application queues deployments/backtests and accepts state changes only through the authenticated worker API.
- [ ] Deployment and backtest states are updated only from verified terminal acknowledgements; no queued command is presented as running or completed.
- [ ] Emergency stop, maximum exposure, maximum drawdown, duplicate-order prevention, stale-price rejection, and market-hours behavior are acceptance-tested.
- [ ] Every supported broker, symbol suffix, account currency, leverage mode, and MT5 build is tested.
- [ ] Live news/data vendors, licenses, attribution, latency, outage behavior, and stale-data indicators are verified.
- [ ] Backtest claims and marketing performance figures are independently reproduced and evidence is archived.

## Security and privacy

- [ ] Independent penetration test covers authentication, authorization, file uploads, worker APIs, SSRF, injection, and cross-user isolation.
- [ ] Session revocation, credential stuffing, password reset/recovery, account deletion, and data export flows are tested.
- [ ] Privacy retention/deletion procedures and a data-processing inventory are approved.
- [ ] Security contact, incident severity process, breach notification process, and on-call ownership are documented.

## Legal and customer operations

- [ ] Qualified counsel approves the Terms, Privacy Policy, Risk Disclosure, jurisdiction eligibility, refund/cancellation terms, and all performance claims.
- [ ] The correct legal entity name, address, governing law, support contact, privacy contact, and billing descriptor are published.
- [ ] Support hours, escalation targets, status-page messaging, and launch-day ownership are staffed.
- [ ] Final desktop/mobile accessibility, browser, payment, email-delivery, onboarding, and account-lifecycle acceptance test is signed off.

Release is authorized only when every applicable item is checked by its accountable owner.
