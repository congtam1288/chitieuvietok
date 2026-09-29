import React from 'react';

interface BankLogoProps {
  code?: string;
  name?: string;
  size?: number | string;
  className?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({
  code = '',
  name = '',
  size = 36,
  className = ''
}) => {
  const normalized = (code || name || '').toUpperCase().trim();

  // Helper dimensions
  const s = typeof size === 'number' ? `${size}px` : size;

  // 1. VIETCOMBANK (VCB)
  if (normalized.includes('VCB') || normalized.includes('VIETCOMBANK')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#005a26] to-[#007A33] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <path
            d="M24 6 C32 6 38 12 38 20 C38 28 32 36 24 42 C16 36 10 28 10 20 C10 12 16 6 24 6 Z"
            fill="#10B981"
            opacity="0.25"
          />
          <path
            d="M24 10 C30 10 34 15 34 21 C34 27 29 33 24 38 C19 33 14 27 14 21 C14 15 18 10 24 10 Z"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M19 21 L23 27 L30 17"
            stroke="#34D399"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // 2. TECHCOMBANK (TCB)
  if (normalized.includes('TCB') || normalized.includes('TECHCOM')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-xs overflow-hidden shrink-0 border border-slate-700/40 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          {/* Dual overlapping Techcombank red rhombuses */}
          <path d="M24 8 L36 20 L24 32 L12 20 Z" fill="#E31837" />
          <path d="M24 16 L32 24 L24 32 L16 24 Z" fill="#FFFFFF" />
          <path d="M24 22 L29 27 L24 32 L19 27 Z" fill="#E31837" />
          <rect x="20" y="35" width="8" height="5" rx="1" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 3. MB BANK (MB / QUÂN ĐỘI)
  if (normalized.includes('MB') || normalized.includes('QUAN DOI')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#001f3f] to-[#002B49] shadow-xs overflow-hidden shrink-0 border border-sky-900/40 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <circle cx="24" cy="24" r="18" fill="#005691" opacity="0.4" />
          <path
            d="M24 10 L27 19 L36 19 L29 25 L32 34 L24 28 L16 34 L19 25 L12 19 L21 19 Z"
            fill="#EF4444"
          />
          <text
            x="24"
            y="42"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            MB
          </text>
        </svg>
      </div>
    );
  }

  // 4. BIDV
  if (normalized.includes('BIDV')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#003366] to-[#005B94] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <rect x="8" y="10" width="32" height="28" rx="6" fill="#8B1E1E" />
          <path
            d="M24 16 L26 21 L31 21 L27 24 L29 29 L24 26 L19 29 L21 24 L17 21 L22 21 Z"
            fill="#FACC15"
          />
          <text
            x="24"
            y="35"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="7"
            fontWeight="bold"
            letterSpacing="0.5"
          >
            BIDV
          </text>
        </svg>
      </div>
    );
  }

  // 5. VIETINBANK (CTG)
  if (normalized.includes('CTG') || normalized.includes('VIETIN')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#00325b] to-[#004B87] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <circle cx="24" cy="24" r="16" fill="#0284C7" opacity="0.3" />
          <circle cx="24" cy="24" r="14" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <rect x="18" y="18" width="12" height="12" fill="#EF4444" rx="2" />
          <circle cx="24" cy="24" r="3" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 6. AGRIBANK (VBA)
  if (normalized.includes('VBA') || normalized.includes('AGRI')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#600000] to-[#8B1E1E] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <rect x="10" y="10" width="28" height="28" rx="4" fill="#047857" opacity="0.4" />
          <rect x="12" y="12" width="24" height="24" rx="3" stroke="#F59E0B" strokeWidth="2" fill="none" />
          {/* Rice ear */}
          <path
            d="M24 14 C27 18 27 24 24 32 M24 16 C22 17 21 20 22 22 M24 20 C26 21 27 24 26 26 M24 24 C22 25 21 28 22 30"
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 7. ACB
  if (normalized.includes('ACB')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#003882] to-[#0052B4] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <circle cx="24" cy="24" r="16" stroke="#FFFFFF" strokeWidth="3" fill="none" />
          <path d="M16 28 L32 20" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
          <text
            x="24"
            y="26"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="9"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            ACB
          </text>
        </svg>
      </div>
    );
  }

  // 8. VPBANK
  if (normalized.includes('VPB') || normalized.includes('VPBANK')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#005432] to-[#008542] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          {/* Blooming lotus petal */}
          <path d="M24 12 C28 17 32 24 24 34 C16 24 20 17 24 12 Z" fill="#EF4444" />
          <path d="M19 18 C14 23 16 30 24 34 C21 28 20 22 19 18 Z" fill="#10B981" />
          <path d="M29 18 C34 23 32 30 24 34 C27 28 28 22 29 18 Z" fill="#10B981" />
        </svg>
      </div>
    );
  }

  // 9. TPBANK
  if (normalized.includes('TPB') || normalized.includes('TPBANK')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3b0764] to-[#581c87] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <path d="M12 36 L24 12 L36 36 Z" stroke="#F97316" strokeWidth="4" strokeLinejoin="round" fill="none" />
          <path d="M20 28 L24 20 L28 28 Z" fill="#C084FC" />
        </svg>
      </div>
    );
  }

  // 10. SACOMBANK (STB)
  if (normalized.includes('STB') || normalized.includes('SACOM')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#002868] to-[#0047AB] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <circle cx="24" cy="24" r="16" fill="#0284C7" opacity="0.3" />
          <text
            x="24"
            y="29"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="14"
            fontWeight="900"
            fontStyle="italic"
            fontFamily="sans-serif"
          >
            SG
          </text>
        </svg>
      </div>
    );
  }

  // 11. HDBANK
  if (normalized.includes('HDB') || normalized.includes('HDBANK')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#990000] to-[#CC0000] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <path d="M12 28 L24 14 L36 28 L24 22 Z" fill="#FACC15" />
          <text
            x="24"
            y="38"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="8"
            fontWeight="bold"
          >
            HDBank
          </text>
        </svg>
      </div>
    );
  }

  // 12. VIB
  if (normalized.includes('VIB')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#001D4A] to-[#003B73] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <path d="M16 28 C16 18 24 14 24 14 C24 14 32 18 32 28" stroke="#F97316" strokeWidth="4" strokeLinecap="round" fill="none" />
          <text
            x="24"
            y="38"
            textAnchor="middle"
            fill="#38BDF8"
            fontSize="9"
            fontWeight="900"
          >
            VIB
          </text>
        </svg>
      </div>
    );
  }

  // 13. MOMO
  if (normalized.includes('MOMO')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#A50064] to-[#C90076] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <rect x="8" y="8" width="32" height="32" rx="10" fill="#FFFFFF" opacity="0.15" />
          <circle cx="24" cy="24" r="14" fill="#FFFFFF" />
          <text
            x="24"
            y="29"
            textAnchor="middle"
            fill="#A50064"
            fontSize="15"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            M
          </text>
        </svg>
      </div>
    );
  }

  // 14. ZALOPAY
  if (normalized.includes('ZALO') || normalized.includes('ZALOPAY')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#005BAA] to-[#0099FF] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <path d="M14 16 H32 L16 32 H34" stroke="#00FF99" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // 15. VIETTEL MONEY
  if (normalized.includes('VIETTEL') || normalized.includes('VTMONEY')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#C40000] to-[#E50000] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <circle cx="20" cy="24" r="10" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.9" />
          <circle cx="28" cy="24" r="10" stroke="#FACC15" strokeWidth="3" fill="none" opacity="0.9" />
        </svg>
      </div>
    );
  }

  // 16. VNPAY
  if (normalized.includes('VNPAY')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#003B73] to-[#005BAA] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <path d="M12 14 L24 34 L36 14" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 14 L24 26 L30 14" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // 17. SHOPEEPAY
  if (normalized.includes('SHOPEE') || normalized.includes('SHOPEEPAY')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#EE4D2D] to-[#F97316] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <rect x="10" y="14" width="28" height="22" rx="4" fill="#FFFFFF" opacity="0.25" />
          <path d="M18 14 C18 10 30 10 30 14" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <text x="24" y="29" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900">S</text>
        </svg>
      </div>
    );
  }

  // 18. VISA
  if (normalized.includes('VISA')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#002244] to-[#1A1F71] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <span className="text-white font-black italic text-xs tracking-tighter drop-shadow-sm font-serif">
          VISA
        </span>
      </div>
    );
  }

  // 19. MASTERCARD
  if (normalized.includes('MASTER') || normalized.includes('MC')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <circle cx="18" cy="24" r="10" fill="#EB001B" />
          <circle cx="30" cy="24" r="10" fill="#F79E1B" opacity="0.9" />
        </svg>
      </div>
    );
  }

  // 20. CASH / TIỀN MẶT
  if (normalized.includes('CASH') || normalized.includes('TIEN MAT') || normalized.includes('VÍ')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#065f46] to-[#10B981] shadow-xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <svg viewBox="0 0 48 48" className="w-4/5 h-4/5" fill="none">
          <rect x="8" y="14" width="32" height="20" rx="3" fill="#34D399" opacity="0.3" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="24" cy="24" r="6" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          <text x="24" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">₫</text>
        </svg>
      </div>
    );
  }

  // Generic fallback with initials
  const initials = (code || name || 'BANK').substring(0, 3).toUpperCase();
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-xs font-black text-[11px] overflow-hidden shrink-0 border border-slate-600/30 ${className}`}
      style={{ width: s, height: s }}
    >
      <span>{initials}</span>
    </div>
  );
};
