"use client";

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function Team() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <section className="py-20 px-4 relative z-10" id="team">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
            {t('team.title').split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? 'text-gradient-gold' : ''}>{word} </span>
            ))}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">{t('team.subtitle')}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <motion.div variants={itemVariants} className="group glass-card overflow-hidden">
            <div className="relative w-full h-64 overflow-hidden">
              <Image alt="Dr. Sarah Mitchell" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg0fnpfiDx637cB9KeG5mSYwzLwiuvkaakXDKSxUNg7hDXcRXpl8kK6Ehg3nPEr9uCw3XIfDdkzwgMrFZorQRcVfaN7o4pLEbM_My4Njd5vJvicovXOuPpIpiVz0o2kXUNfemsA8JVTZjNRg8wwRK9rw_Xp9GX0rVHFQiVVp21-QiD1DnEzxpG6MwL8RU4RCVeIXClemRZGeRskNkTNsSR9QCZBqJRIre55s91O2XEax5xPmUBmWaIAl-oyZ2lLA0ilG_wKcUJgeI" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6 relative">
              <h4 className="text-lg font-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-[#FDF5E6] transition-all">{t('team.doc1.name')}</h4>
              <p className="text-primary text-sm font-semibold mb-3">{t('team.doc1.role')}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{t('team.doc1.desc')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group glass-card overflow-hidden">
            <div className="relative w-full h-64 overflow-hidden">
              <Image alt="Dr. James Wilson" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv7fWzQw9rnVbquHE8C_SizG4lXH6JlnZ2kPHmufR9w4ckYQ4K1gvoPrJVRzHOutfGi-HVlK8kRg4MOngiZEUbDN-knoW8ZQjJVdXdd5E78apFDdUj1_rOUFUbPDmtWU86FWnDTzaEd5vgN7FFgmkAuPrqhYvG4GObwDHS1XO8zJP01jyFBLI6M5ULFc4C3v6VxuFw1L42fV3HMGeCsvY7CB5gWP3gYUXBjS5Z-_ARl_yqwo8Plu4O4xHxvqo-T1y562ZWmvLGRJM" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6 relative">
              <h4 className="text-lg font-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-[#FDF5E6] transition-all">{t('team.doc2.name')}</h4>
              <p className="text-primary text-sm font-semibold mb-3">{t('team.doc2.role')}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{t('team.doc2.desc')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group glass-card overflow-hidden">
            <div className="relative w-full h-64 overflow-hidden">
              <Image alt="Dr. Elena Rodriguez" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPzCozhM419q2C4xPw1iBWan3xp-XjLq34cyfVbGUsA7oHXQb38oFvSmwFmr6K6iRk448nelbdJUwkS1MsA7QJv9Kzh0HrXKL2-smlhiDtxVJDd2MAw3S3hW8VMDNWhRpAOhSwdZRDGJpPc8OcvU3wHe98ZtfTuz66Zo8d6pGKsmbvAP19sKt_kkYbgKg8keQzZmAfPoasigrqKH88-8un18Xkt7r4Nr3g4h7JASTDC8TSYTwg-h1Qd0m2Ue1vHohmLV7MeceeVkw" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6 relative">
              <h4 className="text-lg font-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-[#FDF5E6] transition-all">{t('team.doc3.name')}</h4>
              <p className="text-primary text-sm font-semibold mb-3">{t('team.doc3.role')}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{t('team.doc3.desc')}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group glass-card overflow-hidden">
            <div className="relative w-full h-64 overflow-hidden">
              <Image alt="Dr. David Chen" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD-v_NrCOTnSUmyES1d0wQnjxDooaPkHETAWXX-wazEObLipFt-eyrXvuv1WNXOltW6nVxnGmaJwsocL1NVxh8zF37iY80PNPHseYzyemLpY3jz0iFvqUp_GDN7hSb0ENGxj3Ao9HRUZwqAmHj6hZwfQ3Dcc82lPjSmyt1OuRhyHvCUqduDF-bLKsNR1l7amUNVIeM1AC3II6Ud2h7g35d9Iz-FZgxLYzOKyrarEl2P-mYlzD_mnJGxgGFLy7yyncVXhB6I7pn1ro" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6 relative">
              <h4 className="text-lg font-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-[#FDF5E6] transition-all">{t('team.doc4.name')}</h4>
              <p className="text-primary text-sm font-semibold mb-3">{t('team.doc4.role')}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{t('team.doc4.desc')}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
