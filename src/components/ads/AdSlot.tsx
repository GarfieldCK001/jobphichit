'use client';

import Link from 'next/link';
import { ExternalLink, Megaphone } from 'lucide-react';
import type { AdSlot } from '@/types';

interface AdSlotProps {
  slot: AdSlot;
  className?: string;
}

function isExpired(slot: AdSlot): boolean {
  if (!slot.end_date) return false;
  return new Date(slot.end_date) < new Date();
}

function isActive(slot: AdSlot): boolean {
  return slot.is_active && !!slot.image_url && !isExpired(slot);
}

export default function AdSlotComponent({ slot, className = '' }: AdSlotProps) {
  const sizeMap: Record<string, string> = {
    '728x90': 'ad-leaderboard',
    '468x60': 'ad-banner',
    '300x250': 'ad-rectangle',
    'infeed': 'ad-infeed',
  };

  const sizeClass = sizeMap[slot.slot_size] || 'ad-infeed';
  const active = isActive(slot);

  if (active && slot.image_url) {
    return (
      <div className={`ad-slot ad-slot-active ${sizeClass} ${className}`}>
        {slot.target_url ? (
          <a
            href={slot.target_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            title={slot.advertiser_name || 'โฆษณา'}
            style={{ display: 'block', width: '100%', height: '100%' }}
          >
            <img
              src={slot.image_url}
              alt={slot.advertiser_name || `โฆษณา ช่อง ${slot.slot_number}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
            />
          </a>
        ) : (
          <img
            src={slot.image_url}
            alt={slot.advertiser_name || `โฆษณา ช่อง ${slot.slot_number}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`ad-slot ad-slot-empty ${sizeClass} ${className}`}>
      <div className="ad-slot-empty-icon">
        <Megaphone size={28} color="var(--color-gray-300)" />
      </div>
      <p className="ad-slot-empty-text">
        📢 พื้นที่โฆษณาว่าง<br />
        สนใจลงโฆษณาธุรกิจของคุณ
      </p>
      <a
        href="https://line.me/ti/p/~chanatipfew"
        target="_blank"
        rel="noopener noreferrer"
        className="ad-slot-empty-cta"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
      >
        <ExternalLink size={10} />
        Line: chanatipfew
      </a>
      <span style={{ fontSize: '10px', color: 'var(--color-gray-300)', marginTop: '2px' }}>
        ช่องที่ {slot.slot_number} • {slot.slot_size}
      </span>
    </div>
  );
}
