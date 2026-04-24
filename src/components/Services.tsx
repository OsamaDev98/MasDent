"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

const SERVICES = [
  { icon: 'clean_hands', key: 'item1' },
  { icon: 'auto_awesome', key: 'item2' },
  { icon: 'dentistry', key: 'item3' },
  { icon: 'grid_view', key: 'item4' },
  { icon: 'health_and_safety', key: 'item5' },
  { icon: 'face_retouching_natural', key: 'item6' },
] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55 } },
};

export default function Services() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedService]);

  return (
    <section className="py-24 px-4 relative z-10" id="services">
      {/* Subtle section bg */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label mb-5 inline-flex">
            <span className="material-symbols-outlined text-sm">medical_services</span>
            {t('services.title')}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mt-4 mb-5">
            {t('services.title')}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            {t('services.subtitle')}
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {SERVICES.map(({ icon, key }, idx) => (
            <motion.div
              key={key}
              variants={card}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 18 } }}
              onClick={() => setSelectedService(key)}
              className="group relative p-8 rounded-3xl bg-white border border-slate-100 hover:border-teal-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/6 transition-all duration-400 overflow-hidden cursor-pointer"
            >
              {/* BG gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-3xl" />

              {/* Number watermark */}
              <span className="absolute top-4 right-5 text-7xl font-black text-slate-50 group-hover:text-teal-50 transition-colors select-none leading-none">
                {String(idx + 1).padStart(2, '0')}
              </span>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 text-[#0a4f49] group-hover:bg-gradient-to-br group-hover:from-[#0a4f49] group-hover:to-[#14b8a6] group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-teal-900/20 transition-all duration-400">
                  <span className="material-symbols-outlined text-2xl">{icon}</span>
                </div>

                <h3 className="text-slate-900 text-lg font-bold mb-2.5 group-hover:text-[#0a4f49] transition-colors">
                  {t(`services.${key}.title`)}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                  {t(`services.${key}.desc`)}
                </p>

                {/* Learn more arrow */}
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-slate-300 group-hover:text-[#0a4f49] transition-colors">
                  <span className="uppercase tracking-wider">{t('services.learn_more')}</span>
                  <span className="material-symbols-outlined text-sm translate-x-0 group-hover:translate-x-1 transition-transform rtl:rotate-180">arrow_forward</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm ${isRtl ? 'font-arabic' : 'font-display'}`}
              dir={isRtl ? 'rtl' : 'ltr'}
              style={{ fontFamily: isRtl ? 'var(--font-cairo), sans-serif' : undefined }}
              onClick={() => setSelectedService(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
              >
                {/* Decorative top gradient */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0a4f49] to-[#14b8a6]" />

                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-6 right-6 rtl:left-6 rtl:right-auto w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>

                {(() => {
                  const svc = SERVICES.find(s => s.key === selectedService);
                  if (!svc) return null;
                  return (
                    <div>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 text-[#0a4f49]">
                        <span className="material-symbols-outlined text-3xl">{svc.icon}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">{t(`services.${svc.key}.title`)}</h3>
                      <p className="text-slate-500 text-lg leading-relaxed mb-8">
                        {t(`services.${svc.key}.desc`)}
                      </p>

                      <button
                        onClick={() => {
                          setSelectedService(null);
                          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full h-14 rounded-xl bg-gradient-to-r from-[#0a4f49] to-[#0d6b63] hover:from-[#073d38] hover:to-[#0a4f49] text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/20 active:scale-[0.98]"
                      >
                        <span>{t('hero.cta1')}</span>
                        <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                      </button>
                    </div>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

