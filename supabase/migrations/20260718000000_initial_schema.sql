-- GURUKUL COACHING INSTITUTE INITIAL SCHEMA MIGRATION
-- Created: 2026-07-18
-- Targets: 17 core tables, triggers, sequences, and Row Level Security (RLS) policies

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

----------------------------------------------------
-- HELPER FUNCTIONS & PROCEDURES
----------------------------------------------------

-- Trigger function to automatically update updated_at on row modification
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

----------------------------------------------------
-- TABLE 1: profiles
----------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'admin')),
  full_name text not null,
  email text not null unique,
  phone_number text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS Helper to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
end;
$$ language plpgsql security definer;

-- Trigger to prevent non-admins from escalating roles
create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  if old.role <> new.role then
    -- Allow change if the actor is an admin or if executing via service-role (auth.uid() is null)
    if not (public.is_admin() or auth.uid() is null) then
      raise exception 'Unauthorized role escalation attempt.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins have full access to profiles"
  on public.profiles for all
  using (public.is_admin());

----------------------------------------------------
-- TRIGGER FOR NEW USER REGISTRATION IN AUTH.USERS
----------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, email, phone_nu`mber, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'student_full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone_number', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger tr_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

----------------------------------------------------
-- TABLE 2: admissions
----------------------------------------------------
create table public.admissions (
  id uuid primary key default gen_random_uuid(),
  student_full_name text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female', 'other')),
  guardian_name text not null,
  guardian_relation text not null,
  phone_number text not null,
  email text not null,
  address text not null,
  applying_for_class text not null,
  previous_school text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  linked_student_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- RLS on admissions
alter table public.admissions enable row level security;

create policy "Anyone can submit an admission form"
  on public.admissions for insert
  with check (true);

create policy "Admins can view and edit admissions"
  on public.admissions for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 3: students
----------------------------------------------------
create table public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  admission_id uuid unique references public.admissions(id),
  current_class text not null,
  roll_number text unique not null,
  date_of_birth date not null,
  guardian_name text not null,
  guardian_phone_number text not null,
  address text not null,
  admission_date date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_students_updated_at
  before update on public.students
  for each row execute function public.handle_updated_at();

-- RLS on students
alter table public.students enable row level security;

create policy "Students can view their own student profile"
  on public.students for select
  using (auth.uid() = id);

create policy "Admins can manage students"
  on public.students for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 4: courses
----------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  class_level text not null check (class_level in (
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12'
  )),
  subject_name text not null,
  description text,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (class_level, subject_name)
);

-- RLS on courses
alter table public.courses enable row level security;

create policy "Anyone can view published courses"
  on public.courses for select
  using (is_published = true);

create policy "Authenticated users can select all courses"
  on public.courses for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage courses"
  on public.courses for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 5: student_courses
----------------------------------------------------
create table public.student_courses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

-- RLS on student_courses
alter table public.student_courses enable row level security;

create policy "Students can view their own course enrollments"
  on public.student_courses for select
  using (student_id = auth.uid());

create policy "Admins can manage student course enrollments"
  on public.student_courses for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 6: fee_structures
----------------------------------------------------
create table public.fee_structures (
  id uuid primary key default gen_random_uuid(),
  class_level text not null unique,
  annual_fee_amount numeric(10,2) not null,
  admission_fee_amount numeric(10,2) not null default 0,
  number_of_installments integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_fee_structures_updated_at
  before update on public.fee_structures
  for each row execute function public.handle_updated_at();

-- RLS on fee_structures
alter table public.fee_structures enable row level security;

create policy "Admins can manage fee structures"
  on public.fee_structures for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 7: student_fees
----------------------------------------------------
create table public.student_fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  academic_year text not null,
  total_fee_amount numeric(10,2) not null,
  discount_amount numeric(10,2) not null default 0,
  discount_reason text,
  scholarship_amount numeric(10,2) not null default 0,
  scholarship_reason text,
  net_payable_amount numeric(10,2) generated always as (total_fee_amount - discount_amount - scholarship_amount) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, academic_year),
  check (discount_amount + scholarship_amount <= total_fee_amount)
);

create trigger tr_student_fees_updated_at
  before update on public.student_fees
  for each row execute function public.handle_updated_at();

-- RLS on student_fees
alter table public.student_fees enable row level security;

create policy "Students can view their own fees ledger"
  on public.student_fees for select
  using (student_id = auth.uid());

create policy "Admins can manage student fees"
  on public.student_fees for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 8: fee_installments
----------------------------------------------------
create table public.fee_installments (
  id uuid primary key default gen_random_uuid(),
  student_fee_id uuid not null references public.student_fees(id) on delete cascade,
  installment_number integer not null,
  amount_due numeric(10,2) not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue', 'partially_paid')),
  amount_paid numeric(10,2) not null default 0,
  paid_at timestamptz,
  payment_method text check (payment_method in ('cash', 'bank_transfer', 'cheque', 'upi')),
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (student_fee_id, installment_number)
);

-- RLS on fee_installments
alter table public.fee_installments enable row level security;

create policy "Students can view their own installments"
  on public.fee_installments for select
  using (
    exists (
      select 1 from public.student_fees sf
      where sf.id = fee_installments.student_fee_id
      and sf.student_id = auth.uid()
    )
  );

create policy "Admins can manage fee installments"
  on public.fee_installments for all
  using (public.is_admin());

----------------------------------------------------
-- SEQUENCE FOR RECEIPTS & TABLE 9: fee_receipts
----------------------------------------------------
create sequence public.fee_receipt_seq start with 1 increment by 1;

create table public.fee_receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_number text unique not null,
  student_id uuid not null references public.students(id),
  fee_installment_id uuid not null references public.fee_installments(id),
  amount numeric(10,2) not null,
  payment_method text not null check (payment_method in ('cash', 'bank_transfer', 'cheque', 'upi')),
  issued_by uuid not null references public.profiles(id),
  issued_at timestamptz not null default now(),
  pdf_storage_path text
);

-- RLS on fee_receipts
alter table public.fee_receipts enable row level security;

create policy "Students can view their own receipts"
  on public.fee_receipts for select
  using (student_id = auth.uid());

create policy "Admins can issue receipts"
  on public.fee_receipts for insert
  with check (public.is_admin());

create policy "Admins can view receipts"
  on public.fee_receipts for select
  using (public.is_admin());

-- No update/delete policies are created for fee_receipts to ensure financial records are immutable.

----------------------------------------------------
-- TABLE 10: notifications
----------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  target_student_id uuid references public.students(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- RLS on notifications
alter table public.notifications enable row level security;

create policy "Students can view targeted or broadcast notifications"
  on public.notifications for select
  using (target_student_id = auth.uid() or target_student_id is null);

create policy "Admins can manage notifications"
  on public.notifications for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 11: notification_reads
----------------------------------------------------
create table public.notification_reads (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique (notification_id, student_id)
);

-- RLS on notification_reads
alter table public.notification_reads enable row level security;

create policy "Students can view their own read receipts"
  on public.notification_reads for select
  using (student_id = auth.uid());

create policy "Students can mark notifications as read"
  on public.notification_reads for insert
  with check (student_id = auth.uid());

create policy "Admins can view and manage read receipts"
  on public.notification_reads for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 12: gallery_images
----------------------------------------------------
create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  storage_path text not null,
  category text,
  display_order integer not null default 0,
  is_published boolean not null default true,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- RLS on gallery_images
alter table public.gallery_images enable row level security;

create policy "Anyone can view published gallery images"
  on public.gallery_images for select
  using (is_published = true);

create policy "Admins can manage gallery images"
  on public.gallery_images for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 13: testimonials
----------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role text,
  content text not null,
  avatar_url text,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- RLS on testimonials
alter table public.testimonials enable row level security;

create policy "Anyone can view published testimonials"
  on public.testimonials for select
  using (is_published = true);

create policy "Admins can manage testimonials"
  on public.testimonials for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 14: faqs
----------------------------------------------------
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order integer not null default 0,
  is_published boolean not null default true
);

-- RLS on faqs
alter table public.faqs enable row level security;

create policy "Anyone can view published FAQs"
  on public.faqs for select
  using (is_published = true);

create policy "Admins can manage FAQs"
  on public.faqs for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 15: cms_content
----------------------------------------------------
create table public.cms_content (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  content jsonb not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create trigger tr_cms_content_updated_at
  before update on public.cms_content
  for each row execute function public.handle_updated_at();

-- RLS on cms_content
alter table public.cms_content enable row level security;

create policy "Anyone can view website CMS content"
  on public.cms_content for select
  using (true);

create policy "Admins can manage CMS content"
  on public.cms_content for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 16: contact_submissions
----------------------------------------------------
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone_number text not null,
  message text not null,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS on contact_submissions
alter table public.contact_submissions enable row level security;

create policy "Anyone can submit a contact form"
  on public.contact_submissions for insert
  with check (true);

create policy "Admins can manage contact submissions"
  on public.contact_submissions for all
  using (public.is_admin());

----------------------------------------------------
-- TABLE 17: institute_settings
----------------------------------------------------
create table public.institute_settings (
  id uuid primary key default gen_random_uuid(),
  institute_name text not null,
  logo_storage_path text not null,
  contact_email text not null,
  contact_phone text not null,
  address text not null,
  primary_color text not null,
  updated_at timestamptz not null default now()
);

create trigger tr_institute_settings_updated_at
  before update on public.institute_settings
  for each row execute function public.handle_updated_at();

-- RLS on institute_settings
alter table public.institute_settings enable row level security;

create policy "Anyone can read institute settings"
  on public.institute_settings for select
  using (true);

create policy "Admins can update institute settings"
  on public.institute_settings for update
  using (public.is_admin());

----------------------------------------------------
-- INDEXES FOR PERFORMANCE OPTIMIZATION
----------------------------------------------------
create index idx_profiles_role on public.profiles(role);
create index idx_admissions_status on public.admissions(status);
create index idx_admissions_created_at on public.admissions(created_at);
create index idx_students_class on public.students(current_class);
create index idx_students_active on public.students(is_active);
create index idx_courses_class_order on public.courses(class_level, display_order);
create index idx_fee_installments_status on public.fee_installments(status);
create index idx_fee_installments_due_date on public.fee_installments(due_date);
