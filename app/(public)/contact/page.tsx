import { createClient } from '@/lib/supabase/server';
import ContactForm from '@/components/public/contact-form';

import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  let settings = {
    institute_name: 'Gurukul Coaching Institute',
    contact_email: 'admissions@gurukulcoaching.com',
    contact_phone: '7985347987',
    address: 'Dhodhepur Chauraha Ramapur Tarabganj Gonda',
  };

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('institute_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data) {
      settings = data;
    }
  } catch (error) {
    console.error('Error fetching contact page settings:', error);
  }

  const contacts = [
    {
      icon: <MapPin className="w-5 h-5 text-primary" />,
      label: 'Campus Address',
      value: settings.address,
    },
    {
      icon: <Phone className="w-5 h-5 text-primary" />,
      label: 'Phone Number',
      value: settings.contact_phone,
      href: `tel:${settings.contact_phone.replace(/\s+/g, '')}`,
    },
    {
      icon: <Mail className="w-5 h-5 text-primary" />,
      label: 'Email Address',
      value: settings.contact_email,
      href: `mailto:${settings.contact_email}`,
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      label: 'Office Hours',
      value: 'Monday - Saturday: 10:00 AM - 7:00 PM (Closed Sundays)',
    },
  ];

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Contact Gurukul</h1>
        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
          Have questions about classroom schedules, admissions approvals, or fee payment cycles? Get in touch with our desk office.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-4">
        {/* Contact Info Block */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gurukul Office Desk</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              We provide offline coaching at our main branch. Visit our office during working hours for catalog collection and interview scheduling.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {contacts.map((c, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100 shrink-0">
                  {c.icon}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">{c.label}</h4>
                  {c.href ? (
                    <a href={c.href} className="text-sm font-semibold text-slate-800 hover:text-primary transition-colors leading-relaxed block">
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form Block */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
      <div className="pt-8">
        <div className="w-full h-[450px] rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3556.241108109766!2d81.98039!3d26.959263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3999f714b8c07f51%3A0x7be4b90745a5a5ab!2sGurukul%20coaching%20institute!5e0!3m2!1sen!2sin!4v1784883142088!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
