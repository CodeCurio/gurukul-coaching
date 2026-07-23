import PasswordForm from './password-form';

export default function StudentSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Settings</h1>
        <p className="text-slate-500 text-xs sm:text-sm font-medium">
          Configure security credentials and customize portal layout properties.
        </p>
      </div>

      <PasswordForm />
    </div>
  );
}
