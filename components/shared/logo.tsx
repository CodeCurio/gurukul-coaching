import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  imageOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', imageOnly = false, size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: { img: 36, text: 'text-sm', sub: 'text-[9px]' },
    md: { img: 44, text: 'text-base', sub: 'text-[10px]' },
    lg: { img: 56, text: 'text-xl', sub: 'text-[11px]' },
  };

  const currentSize = sizeMap[size];

  return (
    <Link href="/" className={`flex items-center gap-2.5 group transition-transform duration-150 hover:scale-[1.01] ${className}`}>
      <div className="relative flex-shrink-0 rounded-full p-0.5 bg-gradient-to-r from-secondary to-accent shadow-md">
        <Image
          src="/assets/Logo.png"
          alt="Gurukul Coaching Institute Logo"
          width={currentSize.img}
          height={currentSize.img}
          className="rounded-full object-cover bg-slate-950"
          priority
        />
      </div>
      {!imageOnly && (
        <div className="flex flex-col leading-none">
          <span className={`font-extrabold tracking-tight text-primary-900 ${currentSize.text} font-sans uppercase group-hover:text-primary transition-colors`}>
            GURUKUL
          </span>
          <span className={`text-muted-foreground uppercase tracking-widest font-semibold ${currentSize.sub} mt-0.5`}>
            Coaching Institute
          </span>
        </div>
      )}
    </Link>
  );
}

export default Logo;
