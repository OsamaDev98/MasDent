"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface StaffMember { _id: string; username: string; name: string; role: 'admin' | 'staff'; }

const staffSchema = z.object({
  username: z.string().min(3, 'Min 3 characters').regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers and underscore only'),
  password: z.string().min(8, 'Min 8 characters'),
  name:     z.string().min(2, 'Name required'),
  role:     z.enum(['admin', 'staff']),
});
type StaffForm = z.infer<typeof staffSchema>;

export default function AdminStaffPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: { role: 'staff' },
  });

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/staff');
      const j = await r.json();
      setStaff(j.staff ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSave = async (data: StaffForm) => {
    setSaving(true);
    const tid = toast.loading(isAr ? 'جارٍ الحفظ...' : 'Saving...');
    try {
      const r = await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!r.ok) {
        const j = await r.json();
        toast.error(j.error || (isAr ? 'فشل الحفظ' : 'Failed to save'), { id: tid });
        return;
      }
      toast.success(isAr ? 'تمت إضافة الموظف بنجاح' : 'Staff member added!', { id: tid });
      reset(); setShowForm(false); load();
    } finally { setSaving(false); }
  };

  const changeRole = async (id: string, role: 'admin' | 'staff') => {
    await fetch(`/api/staff/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
    load();
  };

  const deleteStaff = async (id: string) => {
    const tid = toast.loading(isAr ? 'جارٍ الحذف...' : 'Deleting...');
    await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    toast.success(isAr ? 'تم حذف الموظف' : 'Staff member deleted', { id: tid });
    setDelId(null); load();
  };

  const ROLE_CFG = {
    admin: { label: isAr ? 'مدير' : 'Admin', color: 'bg-violet-100 text-violet-700 border-violet-200', icon: 'admin_panel_settings' },
    staff: { label: isAr ? 'موظف' : 'Staff', color: 'bg-teal-100 text-teal-700 border-teal-200',     icon: 'badge' },
  };

  return (
    <DashboardShell
      title={t('staff_management') || (isAr ? 'إدارة الموظفين' : 'Staff Management')}
      subtitle={t('staff_subtitle') || (isAr ? 'أضف وأدر أعضاء الفريق وصلاحياتهم' : 'Manage team members and their permissions')}
      actions={
        <Button onClick={() => { reset(); setShowForm(true); }} className="gap-2">
          <span className="material-symbols-outlined text-sm">person_add</span>
          {t('add_staff') || (isAr ? 'موظف جديد' : 'Add Staff')}
        </Button>
      }
    >
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between mb-4">
                  <Skeleton className="w-14 h-14 rounded-2xl" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
                <Skeleton className="w-2/3 h-6 mb-2" />
                <Skeleton className="w-1/2 h-4 mb-4" />
                <Skeleton className="w-full h-8 mt-4 pt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {staff.map((s, i) => {
              const cfg = ROLE_CFG[s.role];
              return (
                <motion.div key={s._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-dark to-teal-600 flex items-center justify-center text-white font-black text-2xl shadow-md">
                          {s.name[0].toUpperCase()}
                        </div>
                        <div className="flex gap-1.5">
                          <Button variant="ghost" size="icon" onClick={() => setDelId(s._id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-black text-slate-900 text-lg">{s.name}</h3>
                      <p className="text-slate-500 text-sm">@{s.username}</p>
                      <div className="mt-4 pt-4 border-t border-black/5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{isAr ? 'الصلاحية' : 'Role'}</p>
                        <div className="flex gap-2">
                          {(['staff', 'admin'] as const).map(r => (
                            <button key={r} onClick={() => changeRole(s._id, r)}
                              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer transition-all ${s.role === r ? ROLE_CFG[r].color : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                              <span className="material-symbols-outlined text-[13px]">{ROLE_CFG[r].icon}</span>
                              {ROLE_CFG[r].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {staff.length === 0 && !loading && (
            <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col items-center py-16">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">group</span>
              <p className="font-bold text-slate-600">{isAr ? 'لا يوجد موظفون' : 'No staff members yet'}</p>
            </div>
          )}
        </div>
      )}

      {/* Add staff modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">{isAr ? 'إضافة موظف جديد' : 'Add New Staff'}</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                {[
                  { name: 'name' as const,     label: isAr ? 'الاسم الكامل' : 'Full Name',     type: 'text' },
                  { name: 'username' as const, label: isAr ? 'اسم المستخدم' : 'Username',       type: 'text' },
                  { name: 'password' as const, label: isAr ? 'كلمة المرور' : 'Password',        type: 'password' },
                ].map(f => (
                  <div key={f.name}>
                    <Label className="block mb-2">{f.label}</Label>
                    <Input type={f.type} {...register(f.name)} className={errors[f.name] ? 'border-red-500' : ''} />
                    {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]?.message}</p>}
                  </div>
                ))}
                <div>
                  <Label className="block mb-2">{isAr ? 'الصلاحية' : 'Role'}</Label>
                  <select {...register('role')} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="staff">{isAr ? 'موظف' : 'Staff'}</option>
                    <option value="admin">{isAr ? 'مدير' : 'Admin'}</option>
                  </select>
                </div>
                <Button type="submit" disabled={saving} className="w-full gap-2">
                  {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : isAr ? 'إضافة الموظف' : 'Add Staff Member'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {delId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-500 text-3xl">person_remove</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">{isAr ? 'حذف الموظف؟' : 'Remove Staff?'}</h3>
              <p className="text-slate-500 text-sm mb-6">{isAr ? 'لا يمكن التراجع عن هذا الإجراء.' : 'This action cannot be undone.'}</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDelId(null)} className="flex-1">{isAr ? 'تراجع' : 'Cancel'}</Button>
                <Button variant="destructive" onClick={() => deleteStaff(delId)} className="flex-1">{isAr ? 'حذف' : 'Delete'}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
