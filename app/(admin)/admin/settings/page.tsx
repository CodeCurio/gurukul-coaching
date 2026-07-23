import { createClient } from '../../../../lib/supabase/server';
import SettingsManager from './settings-manager';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  let settings = {
    institute_name: 'Gurukul Coaching Institute',
    logo_storage_path: '',
    contact_email: 'admissions@gurukulcoaching.com',
    contact_phone: '+91 98765 43210',
    address: '12, Education Enclave, Sector 4, New Delhi - 110001',
    primary_color: '#4338ca', // Default Indigo 700
  };

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('institute_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data) {
      settings = {
        institute_name: data.institute_name,
        logo_storage_path: data.logo_storage_path || '',
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        address: data.address,
        primary_color: data.primary_color || '#4338ca',
      };
    }
  } catch (error) {
    console.error('Error fetching global settings row:', error);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Configuration</h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Adjust global parameters, brand colors, contact coordinates, and register administrative accounts.
        </p>
      </div>

      <SettingsManager initialSettings={settings} />
    </div>
  );
}
