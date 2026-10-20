import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Ruler, Info } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { isWhite } = useTheme();

  const measurements = [
    { size: 'S', chest: '54 cm', length: '72 cm', shoulder: '50 cm', sleeve: '22 cm' },
    { size: 'M', chest: '57 cm', length: '74 cm', shoulder: '53 cm', sleeve: '23 cm' },
    { size: 'L', chest: '60 cm', length: '76 cm', shoulder: '56 cm', sleeve: '24 cm' },
    { size: 'XL', chest: '63 cm', length: '78 cm', shoulder: '59 cm', sleeve: '25 cm' },
    { size: 'XXL', chest: '66 cm', length: '81 cm', shoulder: '62 cm', sleeve: '26 cm' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl rounded-lg shadow-2xl p-6 border transition-colors ${
          isWhite ? 'bg-white text-black border-zinc-200' : 'bg-zinc-950 text-white border-zinc-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isWhite ? 'border-zinc-200' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Ruler className={`w-5 h-5 ${isWhite ? 'text-black' : 'text-white'}`} />
            <h3
              className={`font-street text-xl font-bold tracking-wider uppercase ${
                isWhite ? 'text-black' : 'text-white'
              }`}
            >
              GUIA DE MEDIDAS &bull; CORTE OVERSIZED
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 cursor-pointer ${isWhite ? 'text-zinc-500 hover:text-black' : 'text-zinc-400 hover:text-white'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p
            className={`text-xs leading-relaxed font-mono ${
              isWhite ? 'text-zinc-600' : 'text-zinc-400'
            }`}
          >
            Todas as nossas t-shirts têm corte <strong className={isWhite ? 'text-black' : 'text-white'}>Boxy Oversized</strong>, com caimento solto e estruturado. Se preferires um corte mais ajustado ao corpo, recomendamos escolher um tamanho abaixo do habitual.
          </p>

          {/* Measurements Table */}
          <div className={`overflow-x-auto rounded border ${isWhite ? 'border-zinc-200' : 'border-zinc-800'}`}>
            <table className="w-full text-left text-xs font-mono">
              <thead
                className={`uppercase border-b ${
                  isWhite
                    ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                }`}
              >
                <tr>
                  <th className="p-2.5">Tamanho</th>
                  <th className="p-2.5">Largura (Peito)</th>
                  <th className="p-2.5">Comprimento</th>
                  <th className="p-2.5">Ombro a Ombro</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isWhite ? 'divide-zinc-200' : 'divide-zinc-900'}`}>
                {measurements.map((row) => (
                  <tr
                    key={row.size}
                    className={`transition-colors ${
                      isWhite ? 'hover:bg-zinc-50' : 'hover:bg-zinc-900/50'
                    }`}
                  >
                    <td className={`p-2.5 font-bold ${isWhite ? 'text-black bg-zinc-50' : 'text-white bg-zinc-950'}`}>
                      {row.size}
                    </td>
                    <td className={`p-2.5 ${isWhite ? 'text-zinc-700' : 'text-zinc-300'}`}>{row.chest}</td>
                    <td className={`p-2.5 ${isWhite ? 'text-zinc-700' : 'text-zinc-300'}`}>{row.length}</td>
                    <td className={`p-2.5 ${isWhite ? 'text-zinc-700' : 'text-zinc-300'}`}>{row.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className={`p-3 rounded flex items-start gap-2 text-[11px] font-mono border ${
              isWhite
                ? 'bg-zinc-50 border-zinc-200 text-zinc-600'
                : 'bg-black border-zinc-900 text-zinc-400'
            }`}
          >
            <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isWhite ? 'text-black' : 'text-white'}`} />
            <span>
              <strong className={isWhite ? 'text-black' : 'text-white'}>Como medir:</strong> Estende uma t-shirt tua favorita sobre uma superfície plana e mede a largura do peito (2cm abaixo da axila) e o comprimento do topo do ombro até à barra inferior.
            </span>
          </div>
        </div>

        <div
          className={`pt-2 border-t flex justify-end ${
            isWhite ? 'border-zinc-200' : 'border-zinc-800'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2 font-street text-xs font-bold tracking-wider uppercase rounded cursor-pointer ${
              isWhite ? 'bg-black text-white hover:bg-zinc-800' : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
