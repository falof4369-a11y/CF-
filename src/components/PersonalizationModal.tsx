import React from 'react';
import { X } from 'lucide-react';
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-black border border-zinc-800 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-lg shadow-2xl p-4 sm:p-6 text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-950 border border-zinc-800 hover:border-zinc-500 transition-colors z-20"
          aria-label="Fechar janela de personalização"
        >
          <X className="w-5 h-5" />
        </button>

        <PersonalizationSection />
      </div>
    </div>
  );
};
