"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface StaffMember { _id: string; username: string; name: string; role: 'admin' | 'staff'; }

const staffSchema = z.object({
  username: z.string().min(3).regex(/^[a-z0-9_]+$/,'Lowercase letters, numbers and underscore only'),
  password: z.string().min(8),
  name:     z.string().min(2),
  role:     z.enum(['admin','staff']),
});
type StaffForm = z.infer<typeof staffSchema>;

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
});

const ROLE_CFG = {
  admin: { label: { en:'Admin', ar:'مدير' },   gradient:'from-violet-500 to-purple-600', bg:'bg-violet-50 border-violet-200 text-violet-700', icon:'admin_panel_settings' },
  staff: { label: { en:'Staff', ar:'موظف' },   gradient:'from-teal-500 to-teal-600',    bg:'bg-teal-50 border-teal-200 text-teal-700',       icon:'badge' },
};

export default function AdminStaffPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';

  const [staff, setStaff]       = useState<StaffMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [delId, setDelId]       = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: { role: 'staff' },
  });

  const load = useCallback(async () => {
    try { const r = await fetch('/api/staff'); const j = await r.json(); setStaff(j.staff ?? []); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSave = async (data: StaffForm) => {
    setSaving(true);
    try {
      const r = await fetch('/api/staff', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
      if (!r.ok) { const j = await r.json(); toast.error(j.error || (isAr ? 'فشل الحفظ' : 'Failed')); return; }
      toast.success(isAr ? 'تمت إضافة الموظف' : 'Staff member added!');
      reset(); setShowForm(false); load();
    } finally { setSaving(false); }
  };

  const changeRole = async (id: string, role: 'admin'|'staff') => {
    await fetch(`/api/staff/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ role }) });
    load();
  };

  const deleteStaff = async (id: string) => {
    await fetch(`/api/staff/${id}`, { method:'DELETE' });
    toast.success(isAr ? 'تم حذف الموظف' : 'Staff member deleted');
    setDelId(null); load();
  };

  const admins = staff.filter(s => s.role === 'admin');
  const members = staff.filter(s => s.role === 'staff');

  return (
    <DashboardShell
      title={isAr ? 'إدارة الموظفين' : 'Staff Management'}
      subtitle={isAr ? 'أضف وأدر أعضاء الفريق وصلاحياتهم' : 'Manage team members and their permissions'}
      actions={
        <button onClick={() => { reset(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/30 text-white text-sm font-bold hover:bg-white/25 backdrop-blur-sm transition-all">
          <span className="material-symbols-outlined text-sm">person_add</span>
          {isAr ? 'موظف جديد' : 'Add Staff'}
        </button>
      }
    >
      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: isAr?'إجمالي الفريق':'Total Team',  value: staff.length,   gradient:'from-slate-500 to-slate-600',   glow:'shadow-slate-400/20' },
            { label: isAr?'المدراء':'Admins',              value: admins.length,  gradient:'from-violet-500 to-purple-600', glow:'shadow-violet-400/20' },
            { label: isAr?'الموظفون':'Staff',              value: members.length, gradient:'from-teal-500 to-teal-600',     glow:'shadow-teal-400/20' },
          ].map((s, i) => (
            <motion.div key={s.label} {...fadeUp(i)}>
              <div className={`relative bg-white rounded-3xl p-5 border border-slate-100 shadow-lg ${s.glow} overflow-hidden`}>
                <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${s.gradient} opacity-10 rounded-full blur-xl`} />
                <p className="text-3xl font-black text-slate-900 tabular-nums">{s.value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-3xl" />)}
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-slate-300">group</span>
          </div>
          <p className="font-bold text-slate-700">{isAr ? 'لا يوجد موظفون' : 'No staff members yet'}</p>
          <p className="text-slate-400 text-sm mt-1">{isAr ? 'أضف أول موظف لعيادتك' : 'Add your first team member'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {staff.map((s, i) => {
              const cfg = ROLE_CFG[s.role];
              return (
                <motion.div key={s._id} {...fadeUp(i)}>
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group relative">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.gradient}`} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-black text-2xl shadow-md`}>
                          {s.name[0].toUpperCase()}
                        </div>
                        <button onClick={() => setDelId(s._id)}
                          className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{s.name}</h3>
                      <p className="text-slate-400 text-sm mt-0.5">@{s.username}</p>

                      <div className="mt-4 pt-4 border-t border-slate-50">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2.5">{isAr?'الصلاحية':'Role'}</p>
                        <div className="flex gap-2">
                          {(['staff','admin'] as const).map(r => (
                            <button key={r} onClick={() => changeRole(s._id, r)}
                              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${s.role === r ? ROLE_CFG[r].bg : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>
                              <span className="material-symbols-outlined text-[13px]">{ROLE_CFG[r].icon}</span>
                              {ROLE_CFG[r].label[isAr ? 'ar' : 'en']}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale:0.95, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl overflow-hidden">

              <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 px-7 py-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage:'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize:'24px 24px' }} />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">person_add</span>
                    </div>
                    <h3 className="text-xl font-black text-white">{isAr ? 'إضافة موظف جديد' : 'Add New Staff'}</h3>
                  </div>
                  <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>

              <div className="p-7">
                <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                  {[
                    { name:'name' as const,     label: isAr?'الاسم الكامل':'Full Name', type:'text',     icon:'person' },
                    { name:'username' as const, label: isAr?'اسم المستخدم':'Username',  type:'text',     icon:'alternate_email' },
                    { name:'password' as const, label: isAr?'كلمة المرور':'Password',   type:'password', icon:'lock' },
                  ].map(f => (
                    <div key={f.name}>
                      <Label className="block mb-1.5 text-sm font-bold text-slate-700">{f.label}</Label>
                      <div className="relative">
                        <span className={`material-symbols-outlined absolute ${isAr?'right-3':'left-3'} top-1/2 -translate-y-1/2 text-slate-400 text-[18px]`}>{f.icon}</span>
                        <Input type={f.type} {...register(f.name)} className={`h-11 rounded-xl border-slate-200 bg-slate-50 ${isAr?'pr-10':'pl-10'} ${errors[f.name]?'border-red-400':''}`} />
                      </div>
                      {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]?.message}</p>}
                    </div>
                  ))}

                  <div>
                    <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr?'الصلاحية':'Role'}</Label>
                    <select {...register('role')} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                      <option value="staff">{isAr?'موظف':'Staff'}</option>
                      <option value="admin">{isAr?'مدير':'Admin'}</option>
                    </select>
                  </div>

                  <button type="submit" disabled={saving}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                    {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      : <><span className="material-symbols-outlined text-sm">person_add</span>{isAr?'إضافة الموظف':'Add Staff Member'}</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {delId && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
            <motion.div initial={{ scale:0.95, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95 }}
              className="bg-white rounded-[2rem] max-w-sm w-full shadow-2xl overflow-hidden text-center">
              <div className="relative bg-gradient-to-br from-red-500 to-red-700 px-7 py-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage:'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize:'24px 24px' }} />
                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">person_remove</span>
                  </div>
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-xl font-black text-slate-900 mb-2">{isAr?'حذف الموظف؟':'Remove Staff?'}</h3>
                <p className="text-slate-500 text-sm mb-6">{isAr?'لا يمكن التراجع عن هذا الإجراء.':'This action cannot be undone.'}</p>
                <div className="flex gap-3">
                  <button onClick={() => setDelId(null)}
                    className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors">
                    {isAr?'تراجع':'Cancel'}
                  </button>
                  <button onClick={() => deleteStaff(delId)}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:-translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined text-sm">delete</span>
                    {isAr?'حذف':'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
