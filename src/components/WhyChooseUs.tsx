"use client";

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function WhyChooseUs() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: isRtl ? 20 : -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-20 px-4 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="w-full lg:w-1/2"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-black mb-6 leading-tight text-white">
            {t('why.title').split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? 'text-gradient-gold' : ''}>{word} </span>
            ))}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-400 text-lg mb-10">{t('why.subtitle')}</motion.p>
            <motion.div variants={itemVariants} className="flex gap-4 group p-5 glass-card mb-4 hover:shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[#0A0A0A] border border-white/10 text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-lg group-hover:shadow-primary/20">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-100 text-lg">{t('why.item1.title')}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{t('why.item1.desc')}</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="flex gap-4 group p-5 glass-card mb-4 hover:shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[#0A0A0A] border border-white/10 text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-lg group-hover:shadow-primary/20">
                <span className="material-symbols-outlined">memory</span>
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-100 text-lg">{t('why.item2.title')}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{t('why.item2.desc')}</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="flex gap-4 group p-5 glass-card mb-4 hover:shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[#0A0A0A] border border-white/10 text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-lg group-hover:shadow-primary/20">
                <span className="material-symbols-outlined">spa</span>
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-100 text-lg">{t('why.item3.title')}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{t('why.item3.desc')}</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="flex gap-4 group p-5 glass-card mb-4 hover:shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[#0A0A0A] border border-white/10 text-primary group-hover:bg-primary group-hover:text-black transition-all shadow-lg group-hover:shadow-primary/20">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-100 text-lg">{t('why.item4.title')}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{t('why.item4.desc')}</p>
              </div>
            </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full lg:w-1/2 relative"
        >
          <div className="rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(13,162,231,0.15)] ring-1 ring-white/10 relative w-full h-[300px] md:h-[500px]">
            <Image
              alt="Happy Patient"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt39rUoisWpF83BvTanM-R9dAri56u5QOi_qlABL8CkSbVzYDyB0RD_O0ENaqvln0t_XQk7sI3w8C3RybD8eLt6v0KmT7VT08mwv35QtNaJBjeaRlIbNGlfu9jvBYqkkqqwBCGx7lEEgxg6XM6a-dH209Pc3MKyi2tBxzRVAJ3pOuGiEv77u8aWvqGjlcXEd0jH6tOpT4gIbKbpjoymSJnAqaQpI1dKBakiLVbPsrLAYNOcw3OfOZPm_Y-PGMQHTisgjqaqxt0SaI"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className={`absolute -bottom-6 ${isRtl ? '-right-6' : '-left-6'} glass p-8 rounded-3xl hidden md:block border-accent/20`}
          >
            <p className="text-4xl font-black mb-1 text-gradient-gold">{t('why.years')}</p>
            <p className="text-sm font-medium opacity-90 uppercase tracking-wider">{t('why.years.text')}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
