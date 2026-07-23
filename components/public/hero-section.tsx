'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight, PhoneCall, Sparkles } from 'lucide-react';
import { ROUTES } from '../../lib/constants/routes';

interface HeroSectionProps {
  hero?: {
    heading: string;
    subheading: string;
    image_path?: string | null;
  } | null;
}

const BANNERS = [
  {
    id: 1,
    src: '/assets/banner1.png',
    alt: 'Gurukul Coaching Institute Banner 1 - Your Success Our Commitment',
    title: 'Your Success, Our Commitment',
    subtitle: 'Best Guidance for a Brighter Tomorrow with Founder Vishal Pandey',
    badge: 'Premier Coaching Institute',
  },
  {
    id: 2,
    src: '/assets/banner2.png',
    alt: 'Gurukul Coaching Institute Banner 2 - United by Goals, Driven by Success',
    title: 'United by Goals. Driven by Success.',
    subtitle: 'Fostering a supportive learning environment & strong foundation',
    badge: 'Class 1 to 12 Admissions',
  },
  {
    id: 3,
    src: '/assets/banner3.png',
    alt: 'Gurukul Coaching Institute Banner 3 - Beyond Books, Building All-Round Champions',
    title: 'Beyond Books. Building All-Round Champions.',
    subtitle: 'Holistic development through academics, sports, dance, music & talent shows',
    badge: 'Holistic Development',
  },
];

const AUTO_SLIDE_INTERVAL = 6000; // 6 seconds per slide

export default function HeroSection({ hero }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPlaying, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentBanner = BANNERS[currentIndex];

  return (
    <section
      className="relative w-screen h-screen min-h-screen bg-slate-950 text-white overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 100% Full Screen Edge-to-Edge Banner Layer */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="relative w-full h-full"
          >
            <Image
              src={currentBanner.src}
              alt={currentBanner.alt}
              fill
              priority
              className="object-cover object-center w-full h-full"
              sizes="100vw"
            />
            {/* Gradient Overlay for Top Navbar & Bottom Floating Controls Legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/15 to-slate-950/85 pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel Navigation Chevron Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-950/60 hover:bg-secondary text-white hover:text-slate-950 border border-white/20 hover:border-secondary flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-200 group active:scale-95"
      >
        <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-950/60 hover:bg-secondary text-white hover:text-slate-950 border border-white/20 hover:border-secondary flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-200 group active:scale-95"
      >
        <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Bottom Floating Glass Control Bar */}
      <div className="absolute bottom-6 left-0 right-0 z-30 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 backdrop-blur-xl border border-white/20 p-3.5 sm:px-6 sm:py-4 rounded-2xl shadow-2xl">
          {/* Quick Info & Hotline */}
          <div className="hidden md:flex items-center gap-3 text-xs sm:text-sm font-medium">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30 font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Admissions Open 2026-27
            </span>
            <span className="text-white/90">Classes 1st to 12th Coaching</span>
          </div>

          {/* Pagination Indicators & Play/Pause */}
          <div className="flex items-center gap-3">
            {BANNERS.map((banner, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={banner.id}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className="relative group py-2"
                >
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-10 sm:w-14 bg-gradient-to-r from-secondary via-accent to-accent-400 shadow-lg shadow-secondary/50'
                        : 'w-2.5 sm:w-3.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                  {isActive && isPlaying && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: AUTO_SLIDE_INTERVAL / 1000, ease: 'linear' }}
                      className="absolute top-2 left-0 h-2.5 rounded-full bg-accent opacity-90 pointer-events-none"
                    />
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              className="ml-2 p-1.5 rounded-lg text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Action CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
            <Link
              href={ROUTES.PUBLIC.REGISTER}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-accent via-accent-400 to-accent-300 hover:brightness-110 active:scale-95 rounded-xl shadow-lg transition-all duration-150 group"
            >
              Register Online
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <a
              href="tel:7985347987"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-secondary" />
              <span className="hidden sm:inline">7985347987</span>
              <span className="sm:hidden">Call</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

