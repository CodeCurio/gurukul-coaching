import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from './profile-form';
import { ROUTES } from '@/lib/constants/routes';


export const dynamic = 'force-dynamic';

export default async function StudentProfilePage() {
  const supabase = await createClient();

  // Fetch current auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  // Fetch student demographics joined with profiles
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, profiles (*)')
    .eq('id', user.id)
    .single();

  if (studentError || !student) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold text-red-500">Record not found</h3>
        <p className="text-slate-500 text-xs sm:text-sm">Please verify your enrollment status with the admin desk.</p>
      </div>
    );
  }

  const profileData: any = student.profiles;

  const initialData = {
    phone_number: profileData.phone_number || '',
    avatar_url: profileData.avatar_url || null,
    guardian_phone_number: student.guardian_phone_number || '',
    address: student.address || '',
    full_name: profileData.full_name,
    roll_number: student.roll_number,
    current_class: student.current_class,
    date_of_birth: student.date_of_birth,
    guardian_name: student.guardian_name,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Profile Profile</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          View your academic enrollment details and manage your contact settings.
        </p>
      </div>

      <ProfileForm initialData={initialData} />
    </div>
  );
}
