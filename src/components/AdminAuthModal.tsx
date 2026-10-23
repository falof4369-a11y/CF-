import React, { useState, useRef, useEffect } from 'react';
import { CFLogo } from './CFLogo';
import { useTheme } from '../context/ThemeContext';
import { verifyAdminPin } from '../services/adminAuth';
import { X, Lock, KeyRound, ShieldAlert, Check } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const { isWhite } = useTheme();
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setPinDigits(['', '', '', '']);
      setErrorMsg('');
      setIsSuccess(false);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const updated = [...pinDigits];
    updated[index] = cleaned;
    setPinDigits(updated);
    setErrorMsg('');

    if (cleaned && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // If all 4 filled, trigger auto-submit
    if (cleaned && index === 3) {
      const fullPin = updated.join('');
      if (fullPin.length === 4) {
        verify(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleNumpad = (digit: string) => {
    const firstEmptyIndex = pinDigits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      handleDigitChange(firstEmptyIndex, digit);
    }
  };

  const handleClear = () => {
    setPinDigits(['', '', '', '']);
    setErrorMsg('');
    inputRefs[0].current?.focus();
  };

  const verify = async (pin: string) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const isValid = await verifyAdminPin(pin);
      if (isValid) {
        setIsSuccess(true);
        setTimeout(() => {
          setLoading(false);
          onAuthenticated();
        }, 500);
      } else {
        setLoading(false);
        setErrorMsg('Código incorreto. Tenta novamente.');
        setPinDigits(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch {
      setLoading(false);
      setErrorMsg('Erro ao autenticar. Tenta novamente.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pinDigits.join('');
    if (pin.length !== 4) {
      setErrorMsg('Por favor introduz os 4 dígitos do código.');
      return;
    }
    verify(pin);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-sm rounded-xl p-6 sm:p-7 shadow-2xl border transition-colors ${
          isWhite
            ? 'bg-white border-zinc-300 text-zinc-900 shadow-xl'
            : 'bg-zinc-950 border-zinc-800 text-white shadow-[0_0_50px_rgba(0,0,0,0.9)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full border transition-colors cursor-pointer ${
            isWhite
              ? 'border-zinc-200 text-zinc-500 hover:text-black hover:border-black'
              : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-white'
          }`}
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-2">
            <CFLogo size="sm" glow />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-zinc-400 font-semibold">
              PAINEL DE CONTROLO
            </span>
          </div>
          <h3
            className={`font-street text-xl sm:text-2xl font-bold tracking-tight uppercase mt-1 ${
              isWhite ? 'text-black' : 'text-white'
            }`}
          >
            Acesso Administrativo
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-[260px] font-mono leading-relaxed">
            Introduz o código de segurança de 4 dígitos para gerir o site CF.
          </p>
        </div>

        {/* PIN Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-3 my-2">
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading || isSuccess}
                className={`w-12 h-14 text-center font-street text-2xl font-bold rounded-lg border focus:outline-none transition-all ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : isWhite
                    ? 'bg-zinc-100 border-zinc-300 focus:border-black text-black'
                    : 'bg-zinc-900 border-zinc-700 focus:border-white text-white'
                }`}
              />
            ))}
          </div>

          {/* Feedback message */}
          {errorMsg && (
            <div className="text-red-500 text-xs text-center font-mono flex items-center justify-center gap-1.5 animate-shake">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="text-emerald-500 text-xs text-center font-mono flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Acesso autorizado. A carregar painel...</span>
            </div>
          )}

          {/* Numpad for mobile convenience */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleNumpad(n)}
                disabled={loading || isSuccess}
                className={`py-2 text-sm font-mono font-bold rounded border transition-colors cursor-pointer ${
                  isWhite
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || isSuccess}
              className={`py-2 text-xs font-mono uppercase rounded border transition-colors cursor-pointer ${
                isWhite
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
              }`}
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => handleNumpad('0')}
              disabled={loading || isSuccess}
              className={`py-2 text-sm font-mono font-bold rounded border transition-colors cursor-pointer ${
                isWhite
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              0
            </button>
            <button
              type="submit"
              disabled={loading || isSuccess || pinDigits.join('').length !== 4}
              className={`py-2 text-xs font-mono uppercase font-bold rounded border transition-all cursor-pointer ${
                pinDigits.join('').length === 4
                  ? isWhite
                    ? 'bg-black text-white border-black hover:bg-zinc-800'
                    : 'bg-white text-black border-white hover:bg-zinc-200'
                  : isWhite
                  ? 'bg-zinc-200 text-zinc-400 border-zinc-300'
                  : 'bg-zinc-900 text-zinc-600 border-zinc-800'
              }`}
            >
              Entrar
            </button>
          </div>
        </form>

        <div className="mt-5 pt-3 border-t border-zinc-800/40 text-center">
          <p className="text-[10px] font-mono text-zinc-500">
            Dica do Administrador: Código de fábrica inicial: <span className="font-bold">2008</span>
          </p>
        </div>
      </div>
    </div>
  );
};
