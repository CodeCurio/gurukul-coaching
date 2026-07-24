import Link from 'next/link';
import Logo from '../shared/logo';
import { ROUTES } from '../../lib/constants/routes';

interface FooterProps {
  settings?: {
    contact_email: string;
    contact_phone: string;
    address: string;
  } | null;
  cmsFooter?: {
    tagline: string;
    copyright_name: string;
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
  } | null;
}

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function Footer({ settings, cmsFooter }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const email = settings?.contact_email || 'admissions@gurukulcoaching.com';
  const phone = settings?.contact_phone || '7985347987';
  const address = settings?.address || 'Dhodhepur Chauraha Ramapur Tarabganj Gonda';
  const tagline = cmsFooter?.tagline || 'Nurturing excellence, conceptual clarity, and academic discipline in physical classrooms since 2014.';
  const copyrightName = cmsFooter?.copyright_name || 'Gurukul Coaching Institute';
  const instagramUrl = cmsFooter?.instagram_url || 'https://www.instagram.com/_gurukulians?igsh=MWQyNnl3aXh1d3loMA==';

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="[&_span:first-child]:text-white [&_span:last-child]:text-secondary-300">
              <Logo size="lg" />
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              {tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href={ROUTES.PUBLIC.HOME} className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PUBLIC.ABOUT} className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>

              <li>
                <Link href={ROUTES.PUBLIC.GALLERY} className="hover:text-white transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PUBLIC.CONTACT} className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Contact Gurukul</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="leading-relaxed">
                <span className="block text-slate-200 font-medium">Address:</span>
                {address}
              </li>
              <li>
                <span className="block text-slate-200 font-medium">Phone:</span>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </li>
              <li>
                <span className="block text-slate-200 font-medium">Email:</span>
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-6">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">
            <InstagramIcon className="w-6 h-6" />
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>
            &copy; {currentYear} {copyrightName}. All rights reserved.
          </p>
          <p className="mt-1">
            Built for offline classroom training and admissions management.
          </p>
        </div>
      </div>
    </footer>
  );
}
