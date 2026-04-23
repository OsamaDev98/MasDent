"use client";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const AVATAR_COLORS = [
  'from-teal-500 to-teal-700',
  'from-violet-500 to-violet-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
];

export default function Testimonials() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [current, setCurrent] = useState(0);
  const [dir, setDir]         = useState(0);

  const testimonials = [
    { rating: 5, text: t('test.1.text'), name: t('test.1.name'), role: t('test.1.role') },
    { rating: 5, text: t('test.2.text'), name: t('test.2.name'), role: t('test.2.role') },
    { rating: 5, text: t('test.3.text'), name: t('test.3.name'), role: t('test.3.role') },
    { rating: 5, text: t('test.4.text'), name: t('test.4.name'), role: t('test.4.role') },
  ];

  const prev = () => { setDir(-1); setCurrent(p => (p === 0 ? testimonials.length - 1 : p - 1)); };
  const next = () => { setDir(1);  setCurrent(p => (p === testimonials.length - 1 ? 0 : p + 1)); };

  const visible = [
    testimonials[current],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ];

  const variants = {
    enter:  (d: number) => ({ x: (isRtl ? -d : d) > 0 ? 80 : -80, opacity: 0, scale: 0.96 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 28 } },
    exit:   (d: number) => ({ x: (isRtl ? -d : d) < 0 ? 80 : -80, opacity: 0, scale: 0.96 }),
  };

  return (
    <section className="py-24 px-4 overflow-hidden relative z-10" id="testimonials">
      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-teal-100/40 to-transparent blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-amber-100/30 to-transparent blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-6"
        >
          <div>
            <span className="section-label mb-5 inline-flex">
              <span className="material-symbols-outlined text-sm">format_quote</span>
              {isRtl ? 'آراء مرضانا' : 'Patient Stories'}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-4 mb-3">
              {t('test.title').split(' ').map((word: string, i: number) => (
                <span key={i} className={i === 1 ? 'text-gradient-gold' : ''}>{word} </span>
              ))}
            </h2>
            <p className="text-slate-500 max-w-lg text-lg font-light">{t('test.subtitle')}</p>
          </div>

          {/* Nav Buttons */}
          <div className="hidden md:flex gap-3" dir="ltr">
            {[{ fn: isRtl ? next : prev, icon: 'chevron_left' }, { fn: isRtl ? prev : next, icon: 'chevron_right' }].map(({ fn, icon }, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={fn}
                className="w-11 h-11 rounded-2xl border-2 border-slate-200 text-slate-500 flex items-center justify-center hover:bg-[#0a4f49] hover:text-white hover:border-[#0a4f49] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">{icon}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="relative">
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.div
              key={current}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {visible.map((testimonial, idx) => (
                <div
                  key={`${current}-${idx}`}
                  className={`relative p-8 rounded-3xl flex flex-col transition-all duration-300 overflow-hidden ${
                    idx === 0
                      ? 'bg-gradient-to-br from-[#0a4f49] to-[#0d6b63] text-white shadow-2xl shadow-teal-900/20'
                      : 'bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-teal-900/5'
                  }`}
                >
                  {/* Decorative quote mark */}
                  <span
                    className={`absolute top-5 ${isRtl ? 'left-5' : 'right-5'} text-7xl font-black leading-none select-none ${
                      idx === 0 ? 'text-white/10' : 'text-slate-100'
                    }`}
                  >
                    &ldquo;
                  </span>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className={`material-symbols-outlined fill-1 text-[16px] ${idx === 0 ? 'text-amber-300' : 'text-amber-400'}`}>star</span>
                    ))}
                  </div>

                  {/* Text */}
                  <p className={`italic leading-relaxed text-[15px] mb-8 line-clamp-4 flex-1 ${idx === 0 ? 'text-white/90' : 'text-slate-600'}`}>
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3.5 mt-auto">
                    <div className={`w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-black text-base shadow-lg`}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h5 className={`font-bold text-sm leading-tight ${idx === 0 ? 'text-white' : 'text-slate-900'}`}>{testimonial.name}</h5>
                      <p className={`text-xs font-semibold mt-0.5 ${idx === 0 ? 'text-teal-300' : 'text-[#0a4f49]'}`}>{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots + Mobile nav */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <div className="flex md:hidden gap-3" dir="ltr">
            <button onClick={isRtl ? next : prev} className="w-10 h-10 rounded-xl border-2 border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100 transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          </div>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i); }}
                className={`transition-all duration-300 rounded-full ${i === current ? 'w-6 h-2 bg-[#0a4f49]' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
          <div className="flex md:hidden gap-3" dir="ltr">
            <button onClick={isRtl ? prev : next} className="w-10 h-10 rounded-xl border-2 border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100 transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
