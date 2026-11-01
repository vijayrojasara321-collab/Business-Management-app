/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Delete, ShieldCheck, X } from 'lucide-react';

interface PinLockModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void;
  correctPin: string;
  title?: string;
  subtitle?: string;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  correctPin,
  title = 'Security Authentication',
  subtitle = 'Enter your 4-digit security PIN to proceed',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setTimeout(() => {
            setPin('');
            onSuccess();
          }, 150);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center relative flex flex-col items-center">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400 mt-1 mb-6">{subtitle}</p>

        {/* PIN Dots */}
        <div className={`flex justify-center gap-4 mb-6 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  error
                    ? 'bg-rose-500 scale-110'
                    : filled
                    ? 'bg-sky-400 scale-110 shadow-lg shadow-sky-500/50'
                    : 'border-2 border-slate-700 bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-400 mb-4 animate-bounce">
            Incorrect PIN. Try again.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xl font-semibold text-white transition flex items-center justify-center border border-slate-700/50"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/40 active:scale-95 text-xs font-semibold text-slate-400 transition flex items-center justify-center border border-slate-800"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xl font-semibold text-white transition flex items-center justify-center border border-slate-700/50"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-700/40 active:scale-95 text-slate-400 hover:text-white transition flex items-center justify-center border border-slate-800"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured on-device with Keystore encryption</span>
        </div>
      </div>
    </div>
  );
};
