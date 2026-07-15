update backtests
set status = 'failed',
    result = coalesce(result, '{}'::jsonb) || '{"reason":"Legacy run had no verified worker acknowledgement."}'::jsonb,
    updated_at = now()
where status in ('running', 'processing') and worker_id is null;

update deployments
set status = 'failed',
    result = coalesce(result, '{}'::jsonb) || '{"reason":"Legacy deployment had no verified worker acknowledgement."}'::jsonb,
    updated_at = now()
where status in ('running', 'processing') and worker_id is null;
