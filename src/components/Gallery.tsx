"use client";
import Image from "next/image";
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function Gallery() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <section className="py-20 px-4 relative z-10" id="gallery">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900">
            {t('gallery.title').split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? 'text-gradient' : ''}>{word} </span>
            ))}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            {t('gallery.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <motion.div variants={itemVariants} className="group glass-card overflow-hidden shadow-xl hover:shadow-2xl transition-all rounded-3xl">
            <div className="h-64 relative overflow-hidden">
              <BeforeAfterSlider
                beforeImage="/before_whitening.png"
                afterImage="/after_whitening.png"
                beforeLabel={t('gallery.before')}
                afterLabel={t('gallery.after')}
              />
            </div>
            <div className="p-6 bg-white">
              <h4 className="text-slate-800 text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-dark group-hover:to-teal-500 transition-all">{t('gallery.item1.title')}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{t('gallery.item1.desc')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group glass-card overflow-hidden shadow-xl hover:shadow-2xl transition-all rounded-3xl">
            <div className="h-64 relative overflow-hidden">
              <BeforeAfterSlider
                beforeImage="/before_ortho.png"
                afterImage="/after_ortho.png"
                beforeLabel={t('gallery.before')}
                afterLabel={t('gallery.after')}
              />
            </div>
            <div className="p-6 bg-white">
              <h4 className="text-slate-800 text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-dark group-hover:to-teal-500 transition-all">{t('gallery.item2.title')}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{t('gallery.item2.desc')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group glass-card overflow-hidden shadow-xl hover:shadow-2xl transition-all rounded-3xl">
            <div className="h-64 relative overflow-hidden">
              <BeforeAfterSlider
                beforeImage="/before_veneers.png"
                afterImage="/after_veneers.png"
                beforeLabel={t('gallery.before')}
                afterLabel={t('gallery.after')}
              />
            </div>
            <div className="p-6 bg-white">
              <h4 className="text-slate-800 text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary-dark group-hover:to-teal-500 transition-all">{t('gallery.item3.title')}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{t('gallery.item3.desc')}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
