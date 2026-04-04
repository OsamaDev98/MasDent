"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function AppointmentForm() {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('app.form.success'));
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <section className="py-24 px-4 relative overflow-hidden z-10" id="contact">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/2"></div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">
            {t('app.title').split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? 'text-gradient' : ''}>{word} </span>
            ))}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t('app.subtitle')}
          </p>
        </motion.div>

        <div className="glass rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative">

          {/* Left Panel */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-2/5 relative p-10 lg:p-14 text-white overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#0f8b7d] pointer-events-none -z-10"></div>
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_80%,_transparent_10%,_#fff_15%,_transparent_20%)] -z-10 mix-blend-overlay"></div>

            <div className="relative z-10">
              <motion.h3 variants={itemVariants} className="text-4xl font-black mb-4 leading-tight whitespace-pre-line">{t('app.left.title')}</motion.h3>
              <motion.p variants={itemVariants} className="opacity-90 mb-12 text-lg font-medium leading-relaxed max-w-sm text-blue-50">
                {t('app.left.desc')}
              </motion.p>
            </div>

            <div className="space-y-8 relative z-10">
              <motion.a href="tel:+15550001234" variants={itemVariants} className="flex items-start gap-4 group cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-xl transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <p className="text-sm text-blue-100 font-medium mb-1">{t('app.left.call')}</p>
                  <p className="font-bold text-xl tracking-wide">+1 (555) 000-1234</p>
                </div>
              </motion.a>
              <motion.a href="mailto:care@masdent.com" variants={itemVariants} className="flex items-start gap-4 group cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-xl transition-colors my-4">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="text-sm text-blue-100 font-medium mb-1">{t('app.left.email')}</p>
                  <p className="font-bold text-xl tracking-wide">care@masdent.com</p>
                </div>
              </motion.a>
              <motion.a href="#contact" variants={itemVariants} className="flex items-start gap-4 group cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-xl transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <p className="text-sm text-blue-100 font-medium mb-1">{t('app.left.address')}</p>
                  <p className="font-medium text-lg tracking-wide leading-snug" dangerouslySetInnerHTML={{ __html: t('app.left.address.val') }}></p>
                </div>
              </motion.a>
            </div>
          </motion.div>

          {/* Right Panel Layout (Form) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-3/5 p-10 lg:p-14 bg-transparent"
          >
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
              <motion.div variants={itemVariants} className="relative group">
                <div className="bg-[#0A0A0A]/60 rounded-2xl border border-white/5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden transition-all duration-300 relative">
                  <input type="text" id="name" className="peer w-full bg-transparent outline-none ltr:pl-14 ltr:pr-5 rtl:pr-14 rtl:pl-5 pt-7 pb-3 text-white relative z-10 font-medium" placeholder=" " required />
                  <label htmlFor="name" className="absolute ltr:left-14 rtl:right-14 top-5 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[11px] peer-focus:text-primary peer-focus:top-2 peer-valid:text-[11px] peer-valid:top-2 z-0 font-bold tracking-wider pointer-events-none">
                    {t('app.form.name')}
                  </label>
                  <span className="material-symbols-outlined absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary z-20 transition-colors pointer-events-none">person</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <div className="bg-[#0A0A0A]/60 rounded-2xl border border-white/5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden transition-all duration-300 relative">
                  <input type="email" id="email" className="peer w-full bg-transparent outline-none ltr:pl-14 ltr:pr-5 rtl:pr-14 rtl:pl-5 pt-7 pb-3 text-white relative z-10 font-medium" placeholder=" " required />
                  <label htmlFor="email" className="absolute ltr:left-14 rtl:right-14 top-5 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[11px] peer-focus:text-primary peer-focus:top-2 peer-valid:text-[11px] peer-valid:top-2 z-0 font-bold tracking-wider pointer-events-none">
                    {t('app.form.email')}
                  </label>
                  <span className="material-symbols-outlined absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary z-20 transition-colors pointer-events-none">mail</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <div className="bg-[#0A0A0A]/60 rounded-2xl border border-white/5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden transition-all duration-300 relative">
                  <input type="tel" id="tel" className="peer w-full bg-transparent outline-none ltr:pl-14 ltr:pr-5 rtl:pr-14 rtl:pl-5 pt-7 pb-3 text-white relative z-10 font-medium" placeholder=" " required />
                  <label htmlFor="tel" className="absolute ltr:left-14 rtl:right-14 top-5 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[11px] peer-focus:text-primary peer-focus:top-2 peer-valid:text-[11px] peer-valid:top-2 z-0 font-bold tracking-wider pointer-events-none">
                    {t('app.form.phone')}
                  </label>
                  <span className="material-symbols-outlined absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary z-20 transition-colors pointer-events-none">phone_iphone</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <div className="bg-[#0A0A0A]/60 rounded-2xl border border-white/5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden transition-all duration-300 relative">
                  <input
                    type="text"
                    id="date"
                    onFocus={(e) => {
                      e.target.type = "date";
                      try {
                        if ('showPicker' in HTMLInputElement.prototype) {
                          (e.target as HTMLInputElement).showPicker();
                        }
                      } catch (err) { }
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = "text";
                    }}
                    className="peer w-full bg-transparent outline-none ltr:pl-14 ltr:pr-5 rtl:pr-14 rtl:pl-5 pt-7 pb-3 text-white relative z-10 font-medium [color-scheme:dark] cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="date" className="absolute ltr:left-14 rtl:right-14 top-5 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[11px] peer-focus:text-primary peer-focus:top-2 peer-valid:text-[11px] peer-valid:top-2 z-0 font-bold tracking-wider pointer-events-none">
                    {t('app.form.date')}
                  </label>
                  <span className="material-symbols-outlined absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary z-20 transition-colors pointer-events-none">calendar_month</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative group sm:col-span-2">
                <div className="bg-[#0A0A0A]/60 rounded-2xl border border-white/5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden transition-all duration-300 relative">
                  <select id="service" className="peer w-full bg-transparent outline-none ltr:pl-14 ltr:pr-5 rtl:pr-14 rtl:pl-5 pt-7 pb-3 text-white relative z-10 font-medium appearance-none cursor-pointer" required defaultValue="">
                    <option value="" disabled className="bg-slate-900 text-slate-400"></option>
                    <option value="1" className="bg-slate-900">{t('app.form.service.1')}</option>
                    <option value="2" className="bg-slate-900">{t('app.form.service.2')}</option>
                    <option value="3" className="bg-slate-900">{t('app.form.service.3')}</option>
                    <option value="4" className="bg-slate-900">{t('app.form.service.4')}</option>
                    <option value="5" className="bg-slate-900">{t('app.form.service.5')}</option>
                  </select>
                  <label htmlFor="service" className="absolute ltr:left-14 rtl:right-14 top-5 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[11px] peer-focus:text-primary peer-focus:top-2 peer-valid:text-[11px] peer-valid:top-2 z-0 font-bold tracking-wider pointer-events-none">
                    {t('app.form.service')}
                  </label>
                  <span className="material-symbols-outlined absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary z-20 transition-colors pointer-events-none">expand_more</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative group sm:col-span-2">
                <div className="bg-[#0A0A0A]/60 rounded-2xl border border-white/5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden transition-all duration-300 relative">
                  <textarea id="notes" className="peer w-full bg-transparent outline-none ltr:pl-14 ltr:pr-5 rtl:pr-14 rtl:pl-5 pt-7 pb-3 text-white relative z-10 font-medium resize-none" placeholder=" " rows={3} required={false}></textarea>
                  <label htmlFor="notes" className="absolute ltr:left-14 rtl:right-14 top-5 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[11px] peer-focus:text-primary peer-focus:top-2 peer-valid:text-[11px] peer-valid:top-2 z-0 font-bold tracking-wider pointer-events-none">
                    {t('app.form.notes')}
                  </label>
                  <span className="material-symbols-outlined absolute ltr:left-5 rtl:right-5 top-6 text-slate-400 group-focus-within:text-primary z-20 transition-colors pointer-events-none">edit_note</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="sm:col-span-2 mt-4">
                <button className="w-full bg-primary text-white rounded-2xl h-14 font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer" type="submit">
                  <span>{t('app.form.submit')}</span>
                  <span className="material-symbols-outlined group-hover:rtl:-translate-x-1 group-hover:translate-x-1 transition-transform rtl:rotate-180">arrow_forward</span>
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  {t('app.form.disclaimer')}
                </p>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

