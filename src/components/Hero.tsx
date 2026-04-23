"use client";

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import HeroImage from "../assets/Hero.jpg";

const STATS = [
  { value: '15+', labelEn: 'Years Experience', labelAr: 'سنة خبرة' },
  { value: '12K+', labelEn: 'Happy Patients', labelAr: 'مريض سعيد' },
  { value: '98%', labelEn: 'Satisfaction Rate', labelAr: 'معدل الرضا' },
];

export default function Hero() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-12 px-4 sm:px-6">

      {/* Ambient background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-teal-400/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[5%] right-[-8%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tl from-amber-300/8 to-transparent blur-3xl" />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-teal-300/6 to-transparent blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-8 ${isRtl ? 'lg:flex-row-reverse' : ''}`}>

          {/* ── Text Side ── */}
          <div className="flex-1 z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 text-[#0a4f49]"
            >
              <span className="w-2 h-2 rounded-full bg-[#0a4f49] animate-pulse" />
              {isRtl ? 'مرحباً بك في ماس دينت' : 'Welcome to Mas Dent Clinic'}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.2] tracking-tight mb-6 text-slate-900"
              dangerouslySetInnerHTML={{ __html: t('hero.title') }}
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-slate-500 text-lg sm:text-xl font-light leading-relaxed mb-10 max-w-lg"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="flex flex-wrap gap-4 items-center mb-14"
            >
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="btn-gold h-14 px-8 text-sm font-black tracking-[0.12em] uppercase gap-2.5 shadow-lg shadow-amber-400/20"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                {t('hero.cta1')}
              </motion.a>
              <motion.a
                href="#services"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="h-14 px-8 text-sm font-bold tracking-wide rounded-full border-2 border-slate-200 text-slate-700 hover:border-[#0a4f49] hover:text-[#0a4f49] hover:bg-teal-50/50 transition-all flex items-center gap-2.5"
              >
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                {t('hero.cta2')}
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-wrap gap-8"
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.value}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                  className="flex flex-col"
                >
                  <span className="text-3xl font-black text-gradient leading-none">{stat.value}</span>
                  <span className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                    {isRtl ? stat.labelAr : stat.labelEn}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ── Image Side ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: isRtl ? -40 : 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative w-full max-w-xl lg:max-w-none"
          >
            {/* Card container */}
            <div className="relative">
              {/* Main image card */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-teal-900/12 ring-1 ring-teal-900/5 aspect-[4/5] max-h-[600px] w-full">
                <Image
                  alt="Modern Dental Clinic Interior"
                  src={HeroImage}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a4f49]/40 via-[#0a4f49]/10 to-transparent mix-blend-multiply opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0a4f49]/20 to-transparent" />
              </div>

              {/* Floating badge – experience */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute ${isRtl ? 'left-4' : 'right-4'} bottom-8 glass-card rounded-2xl px-5 py-4 shadow-xl shadow-slate-900/10`}
              >
                <p className="text-2xl font-black text-gradient leading-none">15+</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {isRtl ? 'سنوات خبرة' : 'Years of Excellence'}
                </p>
              </motion.div>

              {/* Floating badge – rating */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-8 glass-card rounded-2xl px-4 py-3 shadow-xl shadow-slate-900/10`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined fill-1 text-amber-400 text-[14px]">star</span>
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-700">4.9 / 5.0</p>
                <p className="text-[10px] text-slate-400">{isRtl ? 'تقييم المرضى' : 'Patient Rating'}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{isRtl ? 'مرر للأسفل' : 'Scroll'}</p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="material-symbols-outlined text-xl">keyboard_arrow_down</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
