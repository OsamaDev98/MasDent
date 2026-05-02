"use client";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-4 relative z-10 overflow-hidden" id="faq">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-1/3 h-1/2 bg-gradient-to-r from-teal-50/60 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-amber-50/50 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label mb-5 inline-flex">
            <span className="material-symbols-outlined text-sm">help</span>
            {isRtl ? 'الأسئلة الشائعة' : 'FAQ'}
          </span>
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight leading-tight mt-2">
            {t('faq.title').split(' ').map((word: string, i: number) => (
              <span key={i} className={i === 1 ? 'text-gradient-gold' : ''}>{word} </span>
            ))}
          </h2>
          <p className="text-slate-500 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            {t('faq.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                  ? 'bg-white border-teal-200 shadow-xl shadow-teal-900/5'
                  : 'bg-white/60 border-slate-200 hover:border-teal-100 hover:bg-white'
                  }`}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left outline-none group cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <span className={`font-bold text-base transition-colors ${isOpen ? 'text-primary' : 'text-slate-800 group-hover:text-primary'
                    }`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-teal-50 text-primary' : 'bg-slate-100 text-slate-400 group-hover:bg-teal-50 group-hover:text-primary'
                    }`}>
                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                      }`}>
                      expand_more
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent mb-5" />
                        <p className="text-slate-500 text-[15px] font-medium leading-relaxed ltr:pr-12 rtl:pl-12">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
