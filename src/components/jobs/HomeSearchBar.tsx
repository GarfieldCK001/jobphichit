'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const districts = [
  'เมืองพิจิตร', 'กงไกรลาศ', 'โพธิ์ประทับช้าง', 'ตะพานหิน',
  'บางมูลนาก', 'โพทะเล', 'สามง่าม', 'ทับคล้อ', 'สากเหล็ก',
  'วังทรายพูน', 'บึงนาราง', 'ดงเจริญ'
];

interface Props {
  locale: string;
  t_search: string;
  t_placeholder: string;
  t_allDistricts: string;
  t_allTypes: string;
}

export default function HomeSearchBar({ locale, t_search, t_placeholder, t_allDistricts, t_allTypes }: Props) {
  const [keyword, setKeyword] = useState('');
  const [district, setDistrict] = useState('');
  const [jobType, setJobType] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (district) params.set('district', district);
    if (jobType) params.set('type', jobType);
    router.push(`/${locale}/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="hero-search-box">
        <div className="hero-search-input-wrapper">
          <span className="search-icon">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="hero-search-input"
            placeholder={t_placeholder}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            id="hero-search-input"
          />
        </div>
        <select
          className="hero-search-select"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          id="hero-district-select"
        >
          <option value="">{t_allDistricts}</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          className="hero-search-select"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          id="hero-jobtype-select"
        >
          <option value="">{t_allTypes}</option>
          <option value="fulltime">งานประจำ</option>
          <option value="parttime">พาร์ทไทม์</option>
          <option value="daily">รับจ้างรายวัน</option>
        </select>
        <button type="submit" className="btn btn-primary" id="hero-search-btn">
          <Search size={16} /> {t_search}
        </button>
      </div>
    </form>
  );
}
