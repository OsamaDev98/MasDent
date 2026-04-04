"use client";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Testimonials() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const testimonials = [
    {
      rating: 5,
      text: t('test.1.text'),
      name: t('test.1.name'),
      role: t('test.1.role'),
    },
    {
      rating: 5,
      text: t('test.2.text'),
      name: t('test.2.name'),
      role: t('test.2.role'),
    },
    {
      rating: 5,
      text: t('test.3.text'),
      name: t('test.3.text') === t('test.3.name') ? 'Samantha Lee' : t('test.3.name'), // safety default
      role: t('test.3.role'),
    },
    {
      rating: 5,
      text: t('test.4.text'),
      name: t('test.4.name'),
      role: t('test.4.role'),
    }
  ];

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const getVisibleTestimonials = () => {
    return [
      testimonials[currentIndex],
      testimonials[(currentIndex + 1) % testimonials.length],
      testimonials[(currentIndex + 2) % testimonials.length],
    ];
  };

  const variants = {
    enter: (direction: number) => {
      // invert direction if RTL
      const dirX = isRtl ? -direction : direction;
      return {
        x: dirX > 0 ? 100 : -100,
        opacity: 0,
        scale: 0.95
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }
    },
    exit: (direction: number) => {
      const dirX = isRtl ? -direction : direction;
      return {
        zIndex: 0,
        x: dirX < 0 ? 100 : -100,
        opacity: 0,
        scale: 0.95,
        transition: {
          x: { type: "spring" as const, stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 }
        }
      };
    }
  };

  return (
    <section className="py-20 px-4 overflow-hidden relative" id="testimonials">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <h2 className="text-3xl font-black mb-2 relative inline-flex items-center gap-3 text-white">
              {t('test.title').split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? 'text-gradient-gold' : ''}>{word} </span>
              ))}
            </h2>
            <p className="text-slate-400 max-w-lg text-lg">{t('test.subtitle')}</p>
          </div>
          <div className="hidden md:flex gap-3" dir="ltr">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={isRtl ? handleNext : handlePrev}
              className="p-3 border border-slate-800 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <span className="material-symbols-outlined transition-transform">chevron_left</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={isRtl ? handlePrev : handleNext}
              className="p-3 border border-slate-800 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <span className="material-symbols-outlined transition-transform">chevron_right</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {getVisibleTestimonials().map((testimonial, idx) => (
                <div key={`${currentIndex}-${idx}`} className="p-8 glass-card flex flex-col">
                  <div className="flex text-accent mb-6 drop-shadow-sm">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined fill-1">star</span>
                    ))}
                  </div>
                  <p className="text-slate-300 italic mb-8 leading-relaxed text-lg line-clamp-4">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl ring-2 ring-primary/20">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-100 leading-tight">{testimonial.name}</h5>
                      <p className="text-xs text-primary font-medium mt-1">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden justify-center gap-4 mt-8" dir="ltr">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isRtl ? handleNext : handlePrev}
            className="p-3 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isRtl ? handlePrev : handleNext}
            className="p-3 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
