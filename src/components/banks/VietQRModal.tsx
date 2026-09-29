import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Copy,
  Download,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';
import { BankAccount } from '../../types';
import { BankLogo } from './BankLogo';
import { formatVND } from '../../services/voiceParser';

interface VietQRModalProps {
  bank: BankAccount | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VietQRModal: React.FC<VietQRModalProps> = ({ bank, isOpen, onClose }) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('Chuyen khoan Chi Tieu Viet');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !bank) return null;

  // Use BIN or default map for VietQR standard
  const binMap: Record<string, string> = {
    VCB: '970436',
    TCB: '970407',
    MB: '970422',
    BIDV: '970418',
    CTG: '970415',
    VBA: '970405',
    ACB: '970416',
    VPB: '970432',
    TPB: '970423',
    STB: '970403',
    HDB: '970437',
    VIB: '970441',
    SHB: '970443',
    OCB: '970448',
    MSB: '970426'
  };

  const bin = bank.bin || binMap[bank.bankCode] || '970436';
  const cleanAccNum = bank.accountNumber.replace(/\D/g, '') || bank.accountNumber;
  const numAmount = parseFloat(amount.replace(/[.,\s]/g, '')) || 0;

  // Generate official VietQR URL
  const qrUrl = `https://img.vietqr.io/image/${bin}-${cleanAccNum}-compact2.png?amount=${numAmount}&addInfo=${encodeURIComponent(
    description.trim()
  )}&accountName=${encodeURIComponent(bank.accountHolder)}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 flex flex-col max-h-[92vh] overflow-y-auto animate-slide-up text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Mã VietQR Nhận Tiền Thật</h3>
              <p className="text-[10px] text-slate-400">Chuẩn thanh toán quốc gia NAPAS 247</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bank & Account Info Pill */}
        <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <BankLogo code={bank.bankCode} name={bank.bankName} size={36} />
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-800 truncate">{bank.bankName}</div>
              <div className="text-[11px] font-mono font-bold text-blue-600">{bank.accountNumber}</div>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(bank.accountNumber, 'acc')}
            className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-bold flex items-center gap-1 active:scale-95 shadow-2xs shrink-0"
          >
            {copiedKey === 'acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>Sao chép</span>
          </button>
        </div>

        {/* VietQR Generated Card */}
        <div className="mt-3.5 bg-gradient-to-b from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
          <div className="w-56 h-56 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative overflow-hidden">
            <img
              src={qrUrl}
              alt="Mã VietQR chuyển khoản"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          <div className="mt-2.5 text-center">
            <span className="text-[11px] font-bold text-slate-700 block uppercase">
              {bank.accountHolder}
            </span>
            <span className="text-[10px] text-slate-400">
              Quét bằng bất kỳ App ngân hàng nào (VCB, TCB, MB, MoMo...)
            </span>
          </div>
        </div>

        {/* Quick Customize Amount & Note */}
        <div className="mt-3.5 space-y-2.5 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Số tiền cần nhận (tuỳ chọn)
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ví dụ: 200.000 hoặc để trống"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
              />
              {amount && (
                <span className="absolute right-3 top-2.5 text-[10px] text-emerald-600 font-bold">
                  {formatVND(numAmount)}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Nội dung chuyển khoản
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nội dung gửi kèm..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              const fullInfo = `Ngân hàng: ${bank.bankName}\nSố TK: ${bank.accountNumber}\nChủ TK: ${bank.accountHolder}\nSố tiền: ${numAmount ? formatVND(numAmount) : 'Tự nhập'}\nNội dung: ${description}`;
              copyToClipboard(fullInfo, 'all');
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            {copiedKey === 'all' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Sao chép toàn bộ</span>
          </button>

          <a
            href={qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`VietQR_${bank.bankCode}_${cleanAccNum}.png`}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải ảnh mã QR</span>
          </a>
        </div>
      </div>
    </div>
  );
};
