import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Edit2,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  X,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatVND, parseVoiceInput, ParsedVoiceResult } from '../../services/voiceParser';
import { parseTransactionWithGemini } from '../../services/geminiService';

export const VoiceModal: React.FC = () => {
  const {
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    themeConfig,
    categories,
    addTransaction,
    settings,
    t
  } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAmount, setEditedAmount] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number[]>([12, 28, 45, 18, 38, 55, 24, 40, 16, 32]);

  const recognitionRef = useRef<any>(null);
  const animationInterval = useRef<any>(null);

  // Suggested preset phrases for quick testing
  const PRESET_PHRASES = [
    'Mua rau siêu thị 45k',
    'Grab đi làm 50 ngàn',
    'Ăn sáng Highlands 65k',
    'Lương tháng 5 20 triệu',
    'Hóa đơn tiền điện 1tr2'
  ];

  useEffect(() => {
    if (!isVoiceModalOpen) {
      handleStop();
      setTranscript('');
      setParsedResult(null);
      setIsEditing(false);
    }
  }, [isVoiceModalOpen]);

  // Voice wave animation simulator
  const startWaveAnimation = () => {
    animationInterval.current = setInterval(() => {
      setAudioLevel([
        Math.floor(Math.random() * 40) + 10,
        Math.floor(Math.random() * 50) + 15,
        Math.floor(Math.random() * 60) + 20,
        Math.floor(Math.random() * 55) + 15,
        Math.floor(Math.random() * 65) + 25,
        Math.floor(Math.random() * 50) + 20,
        Math.floor(Math.random() * 45) + 10,
        Math.floor(Math.random() * 35) + 10
      ]);
    }, 120);
  };

  const stopWaveAnimation = () => {
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
    }
    setAudioLevel([12, 18, 25, 18, 22, 16, 12, 10]);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsRecording(true);
          startWaveAnimation();
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          if (event.results[current].isFinal) {
            handleProcessTranscript(text);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
          stopWaveAnimation();
        };

        recognition.onend = () => {
          setIsRecording(false);
          stopWaveAnimation();
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.error('Speech recognition init error:', e);
        fallbackSimulatedVoice();
      }
    } else {
      fallbackSimulatedVoice();
    }
  };

  const fallbackSimulatedVoice = () => {
    setIsRecording(true);
    startWaveAnimation();
    const randomPhrase = PRESET_PHRASES[Math.floor(Math.random() * PRESET_PHRASES.length)];
    let index = 0;
    const typing = setInterval(() => {
      index++;
      setTranscript(randomPhrase.substring(0, index));
      if (index >= randomPhrase.length) {
        clearInterval(typing);
        setTimeout(() => {
          handleStop();
          handleProcessTranscript(randomPhrase);
        }, 500);
      }
    }, 60);
  };

  const handleStop = () => {
    setIsRecording(false);
    stopWaveAnimation();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  const handleProcessTranscript = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);

    let parsed = parseVoiceInput(text, categories);

    // If Gemini key is present, enhance with AI
    if (settings.geminiApiKey) {
      const aiParsed = await parseTransactionWithGemini(settings.geminiApiKey, text, categories);
      if (aiParsed) {
        const catObj = categories.find((c) => c.id === aiParsed.categoryId);
        parsed = {
          ...parsed,
          title: aiParsed.title,
          amount: aiParsed.amount,
          type: aiParsed.type,
          categoryId: aiParsed.categoryId,
          categoryName: catObj ? catObj.name : parsed.categoryName
        };
      }
    }

    setParsedResult(parsed);
    setEditedTitle(parsed.title);
    setEditedAmount(parsed.amount);
    setIsProcessing(false);
  };

  const handleSaveTransaction = () => {
    if (!parsedResult) return;

    addTransaction({
      userId: 'user-1',
      title: editedTitle || parsedResult.title,
      amount: editedAmount || parsedResult.amount,
      type: parsedResult.type,
      categoryId: parsedResult.categoryId,
      note: `Nhập qua giọng nói: "${parsedResult.rawText}"`,
      date: parsedResult.date,
      time: parsedResult.time,
      paymentMethod: 'Tiền mặt',
      syncStatus: 'synced'
    });

    setIsVoiceModalOpen(false);
  };

  if (!isVoiceModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ background: themeConfig.cardGradient }}
            >
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{t('enterWithVoice')}</h3>
              <p className="text-[11px] text-slate-400">{t('speakClearly')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsVoiceModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Pillars Value Props (Matching Screenshot 10) */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="bg-emerald-50/60 rounded-2xl p-2.5 text-center border border-emerald-100/50 flex flex-col items-center">
            <Sparkles className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="font-bold text-[10px] text-slate-800 leading-tight">Nhận diện AI</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Tự động phân loại</span>
          </div>

          <div className="bg-blue-50/60 rounded-2xl p-2.5 text-center border border-blue-100/50 flex flex-col items-center">
            <Zap className="w-4 h-4 text-blue-600 mb-1" />
            <span className="font-bold text-[10px] text-slate-800 leading-tight">Tiết kiệm 90%</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Nhanh chóng</span>
          </div>

          <div className="bg-purple-50/60 rounded-2xl p-2.5 text-center border border-purple-100/50 flex flex-col items-center">
            <Volume2 className="w-4 h-4 text-purple-600 mb-1" />
            <span className="font-bold text-[10px] text-slate-800 leading-tight">Đồng bộ tức thì</span>
            <span className="text-[9px] text-slate-500 mt-0.5">Lưu vào sổ cái</span>
          </div>
        </div>

        {/* Dynamic Sound Wave & Recording Button */}
        <div className="flex flex-col items-center justify-center my-3 py-4 bg-slate-50/80 rounded-3xl border border-slate-100">
          {/* Animated Waveform */}
          <div className="flex items-center justify-center gap-1.5 h-14 mb-3">
            {audioLevel.map((height, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full transition-all duration-100"
                style={{
                  height: isRecording ? `${height}px` : '6px',
                  backgroundColor: isRecording ? themeConfig.primary : '#CBD5E1'
                }}
              />
            ))}
          </div>

          {/* Big Circular Microphone Button with Glow Ripple */}
          <div className="relative">
            {isRecording && (
              <div
                className="absolute -inset-3 rounded-full animate-ping opacity-30 pointer-events-none"
                style={{ backgroundColor: themeConfig.primary }}
              />
            )}
            <button
              onClick={isRecording ? handleStop : startSpeechRecognition}
              className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl active:scale-95 transition-all relative z-10"
              style={{
                background: isRecording
                  ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  : themeConfig.floatingBtnBg,
                boxShadow: isRecording
                  ? '0 10px 25px -4px rgba(239, 68, 68, 0.5)'
                  : `0 10px 25px -4px ${themeConfig.primary}60`
              }}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-600 mt-3">
            {isRecording ? t('recording') : t('holdToSpeak')}
          </span>
          <span className="text-[11px] text-slate-400">
            {isRecording ? t('pressToStop') : 'Chạm nút mic để bắt đầu nói'}
          </span>
        </div>

        {/* Live Transcript / Result Preview */}
        {transcript && (
          <div className="bg-slate-50 rounded-2xl p-3 mb-3 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Bạn vừa nói:
            </span>
            <p className="text-sm font-semibold text-slate-800 italic">"{transcript}"</p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-2 py-3 text-slate-600 text-xs font-medium">
            <Sparkles className="w-4 h-4 animate-spin text-emerald-500" />
            <span>{t('processingVoice')}</span>
          </div>
        )}

        {/* Parsed Result Card (Confirmation State) */}
        {parsedResult && !isProcessing && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 mb-3 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 mb-2">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                {t('recognitionResult')}
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                {isEditing ? 'Xong' : 'Sửa'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Tên giao dịch</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Số tiền (₫)</label>
                  <input
                    type="number"
                    value={editedAmount}
                    onChange={(e) => setEditedAmount(Number(e.target.value))}
                    className="w-full bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{editedTitle || parsedResult.title}</div>
                  <div className="text-xs text-slate-500 font-medium">
                    {parsedResult.categoryName} • {parsedResult.date}
                  </div>
                </div>
                <div
                  className={`text-base font-extrabold ${
                    parsedResult.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {parsedResult.type === 'income' ? '+' : '-'}
                  {formatVND(editedAmount || parsedResult.amount)}
                </div>
              </div>
            )}

            <button
              onClick={handleSaveTransaction}
              className="w-full mt-3 py-2.5 rounded-xl text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              style={{ background: themeConfig.cardGradient }}
            >
              <Check className="w-4 h-4" />
              <span>Xác nhận & Thêm giao dịch</span>
            </button>
          </div>
        )}

        {/* Sample Quick Phrases to Click */}
        {!parsedResult && (
          <div className="mt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Câu mẫu thử nhanh:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(phrase);
                    handleProcessTranscript(phrase);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium active:scale-95 transition-all text-left"
                >
                  "{phrase}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
