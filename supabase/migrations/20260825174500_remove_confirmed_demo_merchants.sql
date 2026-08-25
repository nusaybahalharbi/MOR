-- Remove only the original deterministic demo catalog. These eight merchants
-- used reserved 10000000-* IDs, shared one seed timestamp, had no application
-- or merchant_staff ownership, and contained placeholder product names.
delete from public.merchants
where id in (
  '10000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000002'::uuid,
  '10000000-0000-0000-0000-000000000003'::uuid,
  '10000000-0000-0000-0000-000000000004'::uuid,
  '10000000-0000-0000-0000-000000000005'::uuid,
  '10000000-0000-0000-0000-000000000006'::uuid,
  '10000000-0000-0000-0000-000000000007'::uuid,
  '10000000-0000-0000-0000-000000000008'::uuid
);
