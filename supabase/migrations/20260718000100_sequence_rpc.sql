-- Database function to fetch the next value of the fee receipt sequence safely.
-- Useful to invoke from Server Actions via Supabase RPC.

create or replace function public.nextval_receipt_seq()
returns bigint as $$
begin
  return nextval('public.fee_receipt_seq');
end;
$$ language plpgsql security definer;
