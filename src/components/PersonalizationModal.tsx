import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PersonalizationSection } from './PersonalizationSection';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonalizationModal: React.FC<PersonalizationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { isWhite } = useTheme();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-lg shadow-2xl p-4 sm:p-6 my-auto border transition-colors ${
          isWhite ? 'bg-white border-zinc-200 text-black' : 'bg-black border-zinc-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-colors z-20 cursor-pointer ${
            isWhite
              ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black border-zinc-300'
              : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
          }`}
          aria-label="Fechar janela de personalização"
        >
          <X className="w-5 h-5" />
        </button>

        <PersonalizationSection />
      </div>
    </div>
  );
};
