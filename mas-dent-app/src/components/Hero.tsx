"use client";

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function Hero() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <section className="relative px-4 py-8 pt-32">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[3rem] bg-surface border border-white/5 shadow-[0_0_80px_rgba(20,184,166,0.15)] min-h-[600px] md:min-h-[700px] lg:min-h-0 lg:aspect-[21/10] flex items-center"
        >
          <div className="absolute inset-0 z-0 mix-blend-overlay opacity-60">
            <div className={`absolute inset-0 ${isRtl ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-black/90 via-black/50 to-transparent z-10`}></div>
            <Image
              alt="Clinic Interior"
              className="w-full h-full object-cover filter contrast-125 saturate-50"
              src="/hero.png"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              priority
            />
          </div>
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 px-8 py-16 md:px-20 max-w-3xl"
          >
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tighter mb-6 drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400"
              dangerouslySetInnerHTML={{ __html: t('hero.title') }}
            />
            <p className="text-slate-300 text-lg sm:text-xl md:text-2xl font-light mb-10 max-w-xl leading-relaxed tracking-wide">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(212,175,55,0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-accent to-yellow-600 text-white rounded-full h-16 px-10 font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer flex items-center justify-center border border-yellow-500/30"
              >
                {t('hero.cta1')}
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="glass text-white rounded-full h-16 px-10 font-bold text-sm uppercase tracking-[0.15em] hover:border-white/30 transition-all shadow-xl cursor-pointer flex items-center justify-center"
              >
                {t('hero.cta2')}
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
