import React, { useEffect, useState } from 'react';
import { CFLogo } from './CFLogo';

interface IntroCinematicProps {
  onComplete: () => void;
  forcePlay?: boolean;
}

export const IntroCinematic: React.FC<IntroCinematicProps> = ({
  onComplete,
  forcePlay = false,
}) => {
  // Steps:
  // 0: Full Black screen
  // 1: CF Crown symbol appears in center with reveal & subtle glow (0.3s -> 1.0s)
  // 2: CLASS FOCUS letter by letter text appears (1.0s -> 1.8s)
  // 3: White laser beam cuts horizontally across the screen (1.8s -> 2.3s)
  // 4: Smooth fade out reveal into the main app (2.3s -> 2.8s)
  const [step, setStep] = useState<number>(0);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeen = sessionStorage.getItem('cf_intro_seen');

    if ((hasSeen && !forcePlay) || prefersReducedMotion) {
      setDismissed(true);
      onComplete();
      return;
    }

    // Step sequence timings (total ~2.7s)
    const timer1 = setTimeout(() => setStep(1), 250);
    const timer2 = setTimeout(() => setStep(2), 900);
    const timer3 = setTimeout(() => setStep(3), 1700);
    const timer4 = setTimeout(() => setStep(4), 2250);
    const timer5 = setTimeout(() => {
      finishIntro();
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [forcePlay]);

  const finishIntro = () => {
    sessionStorage.setItem('cf_intro_seen', 'true');
    setDismissed(true);
    onComplete();
  };

  if (dismissed) return null;

  const titleLetters = 'CLASS FOCUS'.split('');

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 select-none ${
        step === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Animação de introdução CF Class Focus"
    >
      {/* Background ambient dark grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Skip button in corner */}
      <button
        type="button"
        onClick={finishIntro}
        className="absolute top-6 right-6 z-20 text-[11px] font-mono tracking-[0.25em] text-zinc-400 hover:text-white uppercase px-3 py-1.5 border border-zinc-800 hover:border-zinc-500 rounded bg-black/50 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
      >
        Saltar introdução &rarr;
      </button>

      {/* Centerpiece Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Step 1 & 2: CF Crown Emblem */}
        <div
          className={`transform transition-all duration-1000 ease-out ${
            step >= 1
              ? 'scale-100 opacity-100 translate-y-0 filter drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]'
              : 'scale-90 opacity-0 translate-y-4'
          }`}
        >
          <CFLogo size="hero" glow={step >= 1} />
        </div>

        {/* Step 2: Letter by letter CLASS FOCUS reveal */}
        <div className="h-8 mt-5 flex items-center justify-center space-x-1.5 overflow-hidden">
          {titleLetters.map((char, index) => (
            <span
              key={index}
              className={`font-street text-sm md:text-base tracking-[0.35em] text-white font-bold transition-all duration-300 ease-out inline-block ${
                step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: `${index * 55}ms`,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>

        {/* Brand Mantra reveal */}
        <p
          className={`text-[10px] md:text-xs tracking-[0.3em] font-mono text-zinc-500 uppercase mt-2 transition-all duration-500 ${
            step >= 2 ? 'opacity-90' : 'opacity-0'
          }`}
        >
          VESTE A TUA IDENTIDADE
        </p>
      </div>

      {/* Step 3: Laser beam that cuts horizontally across the screen */}
      <div
        className={`absolute inset-x-0 h-[2px] bg-white shadow-[0_0_20px_#ffffff,0_0_40px_#ffffff] transition-all duration-700 ease-in-out pointer-events-none ${
          step === 3
            ? 'top-1/2 opacity-100 scale-x-100'
            : step > 3
            ? 'top-1/2 opacity-0 scale-x-150'
            : 'top-1/2 opacity-0 scale-x-0'
        }`}
      />

      {/* Flash overlay at laser strike */}
      <div
        className={`absolute inset-0 bg-white transition-opacity duration-300 pointer-events-none ${
          step === 3 ? 'opacity-20' : 'opacity-0'
        }`}
      />
    </div>
  );
};
