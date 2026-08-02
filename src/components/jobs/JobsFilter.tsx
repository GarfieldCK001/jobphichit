'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import type { Category } from '@/types';

interface Props {
  districts: Category[];
  jobCategories: Category[];
  locale: string;
  currentParams: Record<string, string>;
}

export default function JobsFilter({ districts, jobCategories, locale, currentParams }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(currentParams.keyword || '');
  const [jobType, setJobType] = useState(currentParams.type || '');
  const [district, setDistrict] = useState(currentParams.district || '');
  const [category, setCategory] = useState(currentParams.category || '');
  const [salaryMin, setSalaryMin] = useState(currentParams.salaryMin || '');
  const [salaryMax, setSalaryMax] = useState(currentParams.salaryMax || '');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (jobType) params.set('type', jobType);
    if (district) params.set('district', district);
    if (category) params.set('category', category);
    if (salaryMin) params.set('salaryMin', salaryMin);
    if (salaryMax) params.set('salaryMax', salaryMax);
    router.push(`/${locale}/jobs?${params.toString()}`);
  };

  const clearFilters = () => {
    setKeyword('');
    setJobType('');
    setDistrict('');
    setCategory('');
    setSalaryMin('');
    setSalaryMax('');
    router.push(`/${locale}/jobs`);
  };

  const hasFilters = keyword || jobType || district || category || salaryMin || salaryMax;

  return (
    <div style={{ background: 'white', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
      {/* Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '36px' }}
            placeholder="ค้นหาตำแหน่งงาน..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            id="jobs-search-input"
          />
        </div>
        <button onClick={applyFilters} className="btn btn-primary" id="jobs-search-btn">
          <Search size={16} /> ค้นหา
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="btn btn-ghost" title="ล้างตัวกรอง" id="jobs-clear-btn">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <select
          className="filter-select"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          id="jobs-type-filter"
        >
          <option value="">📋 ทุกประเภท</option>
          <option value="fulltime">💼 งานประจำ</option>
          <option value="parttime">⏰ พาร์ทไทม์</option>
          <option value="daily">🌾 รับจ้างรายวัน</option>
        </select>

        <select
          className="filter-select"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          id="jobs-district-filter"
        >
          <option value="">📍 ทุกอำเภอ</option>
          {districts.map((d) => (
            <option key={d.id} value={d.name_th}>{d.name_th}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          id="jobs-category-filter"
        >
          <option value="">🏭 ทุกหมวดหมู่</option>
          {jobCategories.map((c) => (
            <option key={c.id} value={c.id.toString()}>{c.name_th}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <input
            type="number"
            className="filter-select"
            placeholder="เงินเดือนต่ำสุด"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            style={{ width: '130px' }}
            id="jobs-salary-min"
          />
          <span style={{ color: 'var(--color-gray-400)', fontSize: '12px' }}>-</span>
          <input
            type="number"
            className="filter-select"
            placeholder="สูงสุด"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            style={{ width: '100px' }}
            id="jobs-salary-max"
          />
        </div>

        <button onClick={applyFilters} className="btn btn-primary btn-sm" id="jobs-filter-apply-btn">
          <Filter size={14} /> กรอง
        </button>
      </div>
    </div>
  );
}
