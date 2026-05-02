"use client";

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'framer-motion';

const DOCTORS = [
  {
    key: 'doc1',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg0fnpfiDx637cB9KeG5mSYwzLwiuvkaakXDKSxUNg7hDXcRXpl8kK6Ehg3nPEr9uCw3XIfDdkzwgMrFZorQRcVfaN7o4pLEbM_My4Njd5vJvicovXOuPpIpiVz0o2kXUNfemsA8JVTZjNRg8wwRK9rw_Xp9GX0rVHFQiVVp21-QiD1DnEzxpG6MwL8RU4RCVeIXClemRZGeRskNkTNsSR9QCZBqJRIre55s91O2XEax5xPmUBmWaIAl-oyZ2lLA0ilG_wKcUJgeI',
  },
  {
    key: 'doc2',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBv7fWzQw9rnVbquHE8C_SizG4lXH6JlnZ2kPHmufR9w4ckYQ4K1gvoPrJVRzHOutfGi-HVlK8kRg4MOngiZEUbDN-knoW8ZQjJVdXdd5E78apFDdUj1_rOUFUbPDmtWU86FWnDTzaEd5vgN7FFgmkAuPrqhYvG4GObwDHS1XO8zJP01jyFBLI6M5ULFc4C3v6VxuFw1L42fV3HMGeCsvY7CB5gWP3gYUXBjS5Z-_ARl_yqwo8Plu4O4xHxvqo-T1y562ZWmvLGRJM',
  },
  {
    key: 'doc3',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPzCozhM419q2C4xPw1iBWan3xp-XjLq34cyfVbGUsA7oHXQb38oFvSmwFmr6K6iRk448nelbdJUwkS1MsA7QJv9Kzh0HrXKL2-smlhiDtxVJDd2MAw3S3hW8VMDNWhRpAOhSwdZRDGJpPc8OcvU3wHe98ZtfTuz66Zo8d6pGKsmbvAP19sKt_kkYbgKg8keQzZmAfPoasigrqKH88-8un18Xkt7r4Nr3g4h7JASTDC8TSYTwg-h1Qd0m2Ue1vHohmLV7MeceeVkw',
  },
  {
    key: 'doc4',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDD-v_NrCOTnSUmyES1d0wQnjxDooaPkHETAWXX-wazEObLipFt-eyrXvuv1WNXOltW6nVxnGmaJwsocL1NVxh8zF37iY80PNPHseYzyemLpY3jz0iFvqUp_GDN7hSb0ENGxj3Ao9HRUZwqAmHj6hZwfQ3Dcc82lPjSmyt1OuRhyHvCUqduDF-bLKsNR1l7amUNVIeM1AC3II6Ud2h7g35d9Iz-FZgxLYzOKyrarEl2P-mYlzD_mnJGxgGFLy7yyncVXhB6I7pn1ro',
  },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Team() {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-4 relative z-10 bg-gradient-to-b from-slate-50/50 to-white" id="team">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-label mb-5 inline-flex">
            <span className="material-symbols-outlined text-sm">groups</span>
            {t('team.title')}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-4 mb-5">
            {t('team.title').split(' ').map((word: string, i: number) => (
              <span key={i} className={i === 1 ? 'text-gradient-gold' : ''}>{word} </span>
            ))}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            {t('team.subtitle')}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {DOCTORS.map(({ key, src }) => (
            <motion.div
              key={key}
              variants={item}
              whileHover={{ y: -8, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
              className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-teal-100 shadow-sm hover:shadow-2xl hover:shadow-teal-900/8 transition-all duration-400"
            >
              {/* Photo */}
              <div className="relative w-full h-72 overflow-hidden">
                <Image
                  alt={t(`team.${key}.name`)}
                  src={src}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                {/* Hover action */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                    </button>
                    <button className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h4 className="text-slate-900 text-base font-bold group-hover:text-primary transition-colors mb-1">
                  {t(`team.${key}.name`)}
                </h4>
                <p className="text-primary text-xs font-bold uppercase tracking-wider mb-3">{t(`team.${key}.role`)}</p>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{t(`team.${key}.desc`)}</p>

                {/* Divider + rating */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined fill-1 text-amber-400 text-[12px]">star</span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">5.0</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
