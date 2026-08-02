'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Plus, Save, Trash2, MapPin, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import type { Category } from '@/types';

export default function AdminCategoriesPage() {
  const locale = useLocale();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [nameTh, setNameTh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<'job_category' | 'district'>('job_category');
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data: cats } = await supabase.from('categories').select('*').eq('type', 'job_category').order('sort_order');
    const { data: dists } = await supabase.from('categories').select('*').eq('type', 'district').order('sort_order');
    setCategories(cats || []);
    setDistricts(dists || []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameTh.trim()) return;
    setAdding(true);

    const { error } = await supabase.from('categories').insert({
      name_th: nameTh.trim(),
      name_en: nameEn.trim() || nameTh.trim(),
      type,
      sort_order: (type === 'job_category' ? categories.length : districts.length) + 1,
    });

    if (!error) {
      setMsg('เพิ่มหมวดหมู่เรียบร้อย!');
      setNameTh('');
      setNameEn('');
      fetchCategories();
    } else {
      setMsg(`ข้อผิดพลาด: ${error.message}`);
    }
    setAdding(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันลบรายการนี้?')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const navLinks = [
    { href: `/${locale}/admin/dashboard`, label: '📊 ภาพรวม' },
    { href: `/${locale}/admin/jobs`, label: '💼 จัดการประกาศงาน' },
    { href: `/${locale}/admin/users`, label: '👥 จัดการผู้ใช้' },
    { href: `/${locale}/admin/ads`, label: '📣 จัดการโฆษณา 15 ช่อง' },
    { href: `/${locale}/admin/categories`, label: '🏷️ จัดการหมวดหมู่', active: true },
  ];

  if (loading) return <div className="loading-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <ul className="dashboard-nav" style={{ paddingTop: '8px' }}>
              {navLinks.map(({ href, label, active }) => (
                <li key={href}><Link href={href} className={`dashboard-nav-link ${active ? 'active' : ''}`}>{label}</Link></li>
              ))}
            </ul>
          </aside>

          <div className="dashboard-main">
            <div className="dashboard-header">
              <h1 className="dashboard-title">🏷️ จัดการหมวดหมู่งานและอำเภอ</h1>
            </div>

            {msg && <div className="alert alert-info" style={{ marginBottom: '16px' }}>{msg}</div>}

            {/* Add New Category */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-header"><h2 style={{ fontWeight: 700, fontSize: '15px' }}>➕ เพิ่มหมวดหมู่ใหม่</h2></div>
              <div className="card-body">
                <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                  <div>
                    <label className="form-label">ชื่อภาษาไทย</label>
                    <input type="text" className="form-control" placeholder="เช่น การเกษตร, ก่อสร้าง" value={nameTh} onChange={e => setNameTh(e.target.value)} required id="cat-name-th" />
                  </div>
                  <div>
                    <label className="form-label">ชื่อภาษาอังกฤษ</label>
                    <input type="text" className="form-control" placeholder="Agriculture, Construction" value={nameEn} onChange={e => setNameEn(e.target.value)} id="cat-name-en" />
                  </div>
                  <div>
                    <label className="form-label">ประเภท</label>
                    <select className="form-control" value={type} onChange={e => setType(e.target.value as any)}>
                      <option value="job_category">🏷️ หมวดหมู่งาน</option>
                      <option value="district">📍 อำเภอในพิจิตร</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={adding} id="add-cat-btn">
                    <Plus size={16} /> เพิ่ม
                  </button>
                </form>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Job Categories List */}
              <div className="table-wrapper">
                <div className="card-header">
                  <h3 style={{ fontWeight: 700, fontSize: '15px' }}>🏷️ หมวดหมู่งาน ({categories.length})</h3>
                </div>
                <table className="table">
                  <thead>
                    <tr><th>ชื่อไทย</th><th>English</th><th>ลบ</th></tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name_th}</td>
                        <td style={{ color: 'var(--color-gray-500)' }}>{c.name_en}</td>
                        <td>
                          <button onClick={() => handleDelete(c.id)} className="btn btn-danger btn-sm">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Districts List */}
              <div className="table-wrapper">
                <div className="card-header">
                  <h3 style={{ fontWeight: 700, fontSize: '15px' }}>📍 อำเภอพิจิตร ({districts.length})</h3>
                </div>
                <table className="table">
                  <thead>
                    <tr><th>ชื่ออำเภอ</th><th>English</th><th>ลบ</th></tr>
                  </thead>
                  <tbody>
                    {districts.map((d) => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 600 }}>{d.name_th}</td>
                        <td style={{ color: 'var(--color-gray-500)' }}>{d.name_en}</td>
                        <td>
                          <button onClick={() => handleDelete(d.id)} className="btn btn-danger btn-sm">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
