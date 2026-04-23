"use client";

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import HeadImage from "../assets/Head.jpg"

const WHY_ITEMS = [
  { icon: 'verified_user', key: 'item1' },
  { icon: 'memory', key: 'item2' },
  { icon: 'spa', key: 'item3' },
  { icon: 'payments', key: 'item4' },
] as const;

export default function WhyChooseUs() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <section className="py-24 px-4 relative z-10 overflow-hidden">
      {/* BG Decoration */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} w-[40%] h-full bg-gradient-to-l from-teal-50/60 to-transparent`} />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col lg:flex-row gap-16 xl:gap-24 items-center ${isRtl ? 'lg:flex-row-reverse' : ''}`}>

          {/* ── Left: Image ── */}
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-[45%] relative"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-teal-900/10 ring-1 ring-teal-900/5 aspect-[4/5] max-h-[560px]">
              <Image
                alt="Happy Patient at Mas Dent"
                src={HeadImage}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a4f49]/30 via-transparent to-transparent" />
            </div>

            {/* Floating experience badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute -bottom-5 ${isRtl ? '-right-4' : '-left-4'} glass-card rounded-2xl px-6 py-5 shadow-xl shadow-slate-900/10 hidden md:block`}
            >
              <p className="text-4xl font-black text-gradient leading-none">{t('why.years')}</p>
              <p className="text-xs font-bold text-slate-500 mt-1.5 uppercase tracking-wider">{t('why.years.text')}</p>
            </motion.div>

            {/* Floating satisfied-patients badge */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              className={`absolute top-6 ${isRtl ? '-left-4' : '-right-4'} glass-card rounded-2xl px-5 py-3.5 shadow-xl shadow-slate-900/10 hidden md:flex items-center gap-3`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0a4f49] to-[#14b8a6] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[17px]">groups</span>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-none">12K+</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  {isRtl ? 'مريض سعيد' : 'Patients Treated'}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Text ── */}
          <div className="w-full lg:w-[55%]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-label mb-5 inline-flex">
                <span className="material-symbols-outlined text-sm">verified</span>
                {isRtl ? 'لماذا تختارنا' : 'Why Choose Us'}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mt-4 mb-4">
                {t('why.title').split(' ').map((word: string, i: number) => (
                  <span key={i} className={i === 1 ? 'text-gradient-gold' : ''}>{word} </span>
                ))}
              </h2>
              <p className="text-slate-500 text-lg font-light leading-relaxed mb-10">
                {t('why.subtitle')}
              </p>
            </motion.div>

            <div className="space-y-4">
              {WHY_ITEMS.map(({ icon, key }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group flex gap-5 p-5 rounded-2xl bg-white border border-slate-100 hover:border-teal-100 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50 border border-teal-100 text-[#0a4f49] group-hover:bg-gradient-to-br group-hover:from-[#0a4f49] group-hover:to-[#14b8a6] group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-teal-900/20 transition-all duration-300">
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1.5 text-base group-hover:text-[#0a4f49] transition-colors">
                      {t(`why.${key}.title`)}
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{t(`why.${key}.desc`)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
