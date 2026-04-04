"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, Variants } from 'framer-motion';

export default function Services() {
  const { t } = useTranslation();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 px-4 relative z-10" id="services">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{t('services.title')}</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg font-light leading-relaxed">{t('services.subtitle')}</p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="group p-10 rounded-[2.5rem] glass-card flex flex-col justify-start items-start hover:-translate-y-3 transition-transform duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">clean_hands</span>
              </div>
              <h3 className="text-slate-100 text-xl font-bold mb-3">{t('services.item1.title')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t('services.item1.desc')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group p-10 rounded-[2.5rem] glass-card flex flex-col justify-start items-start hover:-translate-y-3 transition-transform duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <h3 className="text-slate-100 text-xl font-bold mb-3">{t('services.item2.title')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t('services.item2.desc')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group p-10 rounded-[2.5rem] glass-card flex flex-col justify-start items-start hover:-translate-y-3 transition-transform duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">dentistry</span>
              </div>
              <h3 className="text-slate-100 text-xl font-bold mb-3">{t('services.item3.title')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t('services.item3.desc')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group p-10 rounded-[2.5rem] glass-card flex flex-col justify-start items-start hover:-translate-y-3 transition-transform duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">grid_view</span>
              </div>
              <h3 className="text-slate-100 text-xl font-bold mb-3">{t('services.item4.title')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t('services.item4.desc')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group p-10 rounded-[2.5rem] glass-card flex flex-col justify-start items-start hover:-translate-y-3 transition-transform duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">health_and_safety</span>
              </div>
              <h3 className="text-slate-100 text-xl font-bold mb-3">{t('services.item5.title')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t('services.item5.desc')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group p-10 rounded-[2.5rem] glass-card flex flex-col justify-start items-start hover:-translate-y-3 transition-transform duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:scale-110">
                <span className="material-symbols-outlined text-2xl">face_retouching_natural</span>
              </div>
              <h3 className="text-slate-100 text-xl font-bold mb-3">{t('services.item6.title')}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t('services.item6.desc')}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
