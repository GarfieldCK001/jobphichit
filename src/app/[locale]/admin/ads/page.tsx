'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Megaphone, Save, Image, ExternalLink, Calendar, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import type { AdSlot } from '@/types';

export default function AdminAdsPage() {
  const locale = useLocale();
  const supabase = createClient();

  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    const { data } = await supabase.from('ad_slots').select('*').order('slot_number');
    if (data && data.length > 0) {
      setSlots(data);
    } else {
      // Create empty 15 slots
      const initial = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        slot_number: i + 1,
        slot_name: `ช่องโฆษณาที่ ${i + 1}`,
        slot_position: i < 2 ? 'header' : i < 6 ? 'sidebar' : i < 10 ? 'infeed' : i < 12 ? 'between' : 'footer',
        slot_size: i < 2 ? '468x60' : i < 6 ? '300x250' : 'infeed',
        image_url: null,
        target_url: null,
        advertiser_name: null,
        start_date: null,
        end_date: null,
        is_active: false,
        contact_line: 'chanatipfew',
        created_at: new Date().toISOString(),
      }));
      setSlots(initial as any);
    }
    setLoading(false);
  };

  const handleEdit = (slot: AdSlot) => {
    setEditingSlot({ ...slot });
  };

  const handleSaveSlot = async () => {
    if (!editingSlot) return;
    setSaving(true);

    const { error } = await supabase.from('ad_slots').upsert({
      slot_number: editingSlot.slot_number,
      slot_name: editingSlot.slot_name,
      slot_position: editingSlot.slot_position,
      slot_size: editingSlot.slot_size,
      image_url: editingSlot.image_url || null,
      target_url: editingSlot.target_url || null,
      advertiser_name: editingSlot.advertiser_name || null,
      start_date: editingSlot.start_date || null,
      end_date: editingSlot.end_date || null,
      is_active: editingSlot.is_active,
      contact_line: 'chanatipfew',
    }, { onConflict: 'slot_number' });

    if (!error) {
      setMessage(`บันทึกโฆษณาช่อง ${editingSlot.slot_number} เรียบร้อย!`);
      setEditingSlot(null);
      fetchSlots();
    } else {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 4000);
  };

  const navLinks = [
    { href: `/${locale}/admin/dashboard`, label: '📊 ภาพรวม' },
    { href: `/${locale}/admin/jobs`, label: '💼 จัดการประกาศงาน' },
    { href: `/${locale}/admin/users`, label: '👥 จัดการผู้ใช้' },
    { href: `/${locale}/admin/ads`, label: '📣 จัดการโฆษณา 15 ช่อง', active: true },
    { href: `/${locale}/admin/categories`, label: '🏷️ จัดการหมวดหมู่' },
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
              <h1 className="dashboard-title">📣 ระบบปล่อยเช่าพื้นที่โฆษณา 15 ช่อง</h1>
              <p className="dashboard-subtitle">จัดการแบนเนอร์, ลิงก์ร้านค้า และวันหมดอายุโฆษณา</p>
            </div>

            {message && <div className="alert alert-info" style={{ marginBottom: '16px' }}>ℹ️ {message}</div>}

            {/* Grid 15 Slots */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {slots.map((slot) => (
                <div
                  key={slot.slot_number}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${slot.is_active && slot.image_url ? 'var(--color-primary-500)' : 'var(--color-gray-300)'}`,
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-gray-900)' }}>
                      ช่องที่ {slot.slot_number}: {slot.slot_name}
                    </div>
                    <span className={`badge ${slot.is_active && slot.image_url ? 'badge-success' : 'badge-gray'}`}>
                      {slot.is_active && slot.image_url ? 'มีโฆษณา' : 'ว่าง'}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '12px' }}>
                    ตำแหน่ง: <strong>{slot.slot_position}</strong> | ขนาด: <strong>{slot.slot_size}</strong>
                  </div>

                  {/* Thumbnail / Image Preview */}
                  {slot.image_url ? (
                    <div style={{ height: '80px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', background: '#000' }}>
                      <img src={slot.image_url} alt={slot.advertiser_name || 'Ad'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ height: '80px', borderRadius: '8px', background: 'var(--color-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-400)', fontSize: '12px', marginBottom: '12px' }}>
                      📷 ยังไม่มีรูปภาพโฆษณา
                    </div>
                  )}

                  {slot.advertiser_name && (
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-800)', marginBottom: '4px' }}>
                      🏢 {slot.advertiser_name}
                    </div>
                  )}

                  {slot.end_date && (
                    <div style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginBottom: '12px' }}>
                      ⏱️ หมดอายุ: {new Date(slot.end_date).toLocaleDateString('th-TH')}
                    </div>
                  )}

                  <button onClick={() => handleEdit(slot)} className="btn btn-secondary btn-sm btn-block" id={`edit-slot-${slot.slot_number}`}>
                    ✏️ แก้ไขโฆษณาช่องนี้
                  </button>
                </div>
              ))}
            </div>

            {/* Modal for editing slot */}
            {editingSlot && (
              <div className="modal-overlay" onClick={() => setEditingSlot(null)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2 className="modal-title">✏️ แก้ไขโฆษณาช่องที่ {editingSlot.slot_number}</h2>
                    <button onClick={() => setEditingSlot(null)} className="btn btn-ghost btn-icon">✕</button>
                  </div>

                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label">ชื่อผู้ลงโฆษณา / ร้านค้า</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="เช่น ร้านกาแฟพิจิตร, สวนส้มพิจิตร"
                        value={editingSlot.advertiser_name || ''}
                        onChange={(e) => setEditingSlot({ ...editingSlot, advertiser_name: e.target.value })}
                        id="ad-advertiser-name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">URL รูปภาพแบนเนอร์ (Image URL)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://example.com/banner.jpg"
                        value={editingSlot.image_url || ''}
                        onChange={(e) => setEditingSlot({ ...editingSlot, image_url: e.target.value })}
                        id="ad-image-url"
                      />
                      <span className="form-hint">สามารถใช้รูปจาก Imgur, Supabase Storage หรือเว็บภายนอกได้</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">ลิงก์เมื่อคลิก (Target Link URL)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://facebook.com/your-shop หรือ Line link"
                        value={editingSlot.target_url || ''}
                        onChange={(e) => setEditingSlot({ ...editingSlot, target_url: e.target.value })}
                        id="ad-target-url"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">วันที่เริ่มโฆษณา</label>
                        <input
                          type="date"
                          className="form-control"
                          value={editingSlot.start_date ? editingSlot.start_date.split('T')[0] : ''}
                          onChange={(e) => setEditingSlot({ ...editingSlot, start_date: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">วันที่สิ้นสุด (หมดอายุ)</label>
                        <input
                          type="date"
                          className="form-control"
                          value={editingSlot.end_date ? editingSlot.end_date.split('T')[0] : ''}
                          onChange={(e) => setEditingSlot({ ...editingSlot, end_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', marginTop: '12px' }}>
                      <input
                        type="checkbox"
                        checked={editingSlot.is_active}
                        onChange={(e) => setEditingSlot({ ...editingSlot, is_active: e.target.checked })}
                        style={{ accentColor: 'var(--color-primary-500)', width: '18px', height: '18px' }}
                        id="ad-is-active"
                      />
                      <span style={{ fontWeight: 600 }}>เปิดใช้งานโฆษณาช่องนี้ (แสดงผลบนเว็บ)</span>
                    </label>
                  </div>

                  <div className="modal-footer">
                    <button onClick={() => setEditingSlot(null)} className="btn btn-ghost">ยกเลิก</button>
                    <button onClick={handleSaveSlot} className="btn btn-primary" disabled={saving} id="save-ad-slot-btn">
                      <Save size={16} /> {saving ? 'กำลังบันทึก...' : 'บันทึกโฆษณา'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
