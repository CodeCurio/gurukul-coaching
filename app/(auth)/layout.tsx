import React from 'react';
import Logo from '../../components/shared/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-50 rounded-full filter blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-85 h-85 bg-secondary-50 rounded-full filter blur-3xl opacity-60 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-6 relative z-10">
        <div className="inline-block bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          <Logo />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 rounded-3xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
