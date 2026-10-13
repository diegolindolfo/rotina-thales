import React, { useState, useRef } from 'react';
import { RoutineCard, CARD_COLORS, ROUTINE_EMOJIS } from '../types/routine';
import { uid } from '../utils/storage';
import { X, Trash2, Camera, Sparkles } from 'lucide-react';

interface CardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardIndex: number | null; // -1 or null for new card
  initialCard?: RoutineCard;
  defaultTime?: string;
  onSave: (card: RoutineCard, index: number | null) => void;
  onDelete?: (index: number) => void;
}

const COMMON_TASKS = [
  'Acordar',
  'Entrada na Escola',
  'Acolhimento e Roda',
  'Atividade em Sala',
  'Intervalo e Lanche',
  'Recreio e Pátio',
  'Artes e Desenho',
  'Guardar Mochila',
  'Saída da Escola',
  'Almoço',
  'Banho',
  'Tarefas da escola',
  'Brincar',
  'Passeio',
  'Jantar',
  'Escovar os dentes',
  'Dormir',
];

export const CardEditModal: React.FC<CardEditModalProps> = ({
  isOpen,
  onClose,
  cardIndex,
  initialCard,
  defaultTime = '08:00',
  onSave,
  onDelete,
}) => {
  const [time, setTime] = useState(initialCard?.t || defaultTime);
  const [title, setTitle] = useState(initialCard?.x || '');
  const [emoji, setEmoji] = useState(initialCard?.e || '⭐');
  const [colorIdx, setColorIdx] = useState(initialCard?.c ?? 0);
  const [photo, setPhoto] = useState<string | undefined>(initialCard?.p);

  React.useEffect(() => {
    if (isOpen) {
      setTime(initialCard?.t || defaultTime);
      setTitle(initialCard?.x || '');
      setEmoji(initialCard?.e || '⭐');
      setColorIdx(initialCard?.c ?? 0);
      setPhoto(initialCard?.p);
    }
  }, [isOpen, initialCard, defaultTime]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const size = 240;
      const minDim = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          img,
          (img.width - minDim) / 2,
          (img.height - minDim) / 2,
          minDim,
          minDim,
          0,
          0,
          size,
          size
        );
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhoto(dataUrl);
      }
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard: RoutineCard = {
      id: initialCard?.id || uid(),
      t: time || '08:00',
      x: title.trim() || 'Nova atividade',
      e: emoji.trim() || '⭐',
      c: colorIdx % 6,
      p: photo || undefined,
    };
    onSave(newCard, cardIndex);
    onClose();
  };

  const isEditing = cardIndex !== null && cardIndex >= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#f6f3ec] p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e3ded3]">
          <h3 className="text-xl font-bold text-[#2b2f36] flex items-center gap-2">
            <span>{isEditing ? '✏️ Editar Cartão' : '➕ Novo Cartão'}</span>
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#e3ded3] text-[#7a7f87] hover:text-[#2b2f36]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Time & Title Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-[#7a7f87] mb-1 uppercase tracking-wider">
                Horário
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full rounded-xl bg-white border border-[#e3ded3] px-3 py-2.5 text-lg font-bold text-[#2b2f36] outline-none focus:border-[#4a7c9d]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#7a7f87] mb-1 uppercase tracking-wider">
                Nome da atividade
              </label>
              <input
                type="text"
                placeholder="Ex.: Banho, Almoço..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl bg-white border border-[#e3ded3] px-3 py-2.5 text-base font-semibold text-[#2b2f36] outline-none focus:border-[#4a7c9d]"
              />
            </div>
          </div>

          {/* Quick task suggestions */}
          <div>
            <label className="block text-xs font-bold text-[#7a7f87] mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Sugestões rápidas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TASKS.map((taskName) => (
                <button
                  type="button"
                  key={taskName}
                  onClick={() => setTitle(taskName)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium ${
                    title === taskName
                      ? 'bg-[#4a7c9d] text-white border-[#4a7c9d]'
                      : 'bg-white text-[#2b2f36] border-[#e3ded3] hover:bg-stone-50'
                  }`}
                >
                  {taskName}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Photo (Optional) */}
          <div className="rounded-2xl bg-white p-3 border border-[#e3ded3]">
            <label className="block text-xs font-bold text-[#7a7f87] mb-1.5 uppercase tracking-wider">
              Foto da Rotina (Opcional - substitui o ícone)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#e3ded3] bg-stone-50 flex items-center justify-center overflow-hidden flex-none">
                {photo ? (
                  <img src={photo} alt="Prévia" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-60">{emoji}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-[#4a7c9d]/10 text-[#4a7c9d] text-xs font-bold hover:bg-[#4a7c9d]/20 transition flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  {photo ? 'Trocar foto' : 'Enviar foto'}
                </button>
                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto(undefined)}
                    className="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Emoji / Symbol */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#7a7f87] uppercase tracking-wider">
                Ícone / Emoji
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7a7f87]">Personalizado:</span>
                <input
                  type="text"
                  value={emoji}
                  maxLength={4}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-12 h-9 text-center text-xl rounded-lg bg-white border border-[#e3ded3]"
                />
              </div>
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl bg-white/70 border border-[#e3ded3]">
              {ROUTINE_EMOJIS.map((eItem, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setEmoji(eItem)}
                  className={`h-10 text-2xl flex items-center justify-center rounded-lg border-2 transition ${
                    emoji === eItem
                      ? 'border-[#4a7c9d] bg-[#dcebf5] scale-105'
                      : 'border-transparent hover:bg-stone-100'
                  }`}
                >
                  {eItem}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <label className="block text-xs font-bold text-[#7a7f87] mb-2 uppercase tracking-wider">
              Cor do Cartão
            </label>
            <div className="flex gap-2">
              {CARD_COLORS.map((bgHex, cIdx) => (
                <button
                  type="button"
                  key={cIdx}
                  onClick={() => setColorIdx(cIdx)}
                  style={{ backgroundColor: bgHex }}
                  className={`flex-1 h-11 rounded-xl border-3 transition-transform ${
                    colorIdx === cIdx
                      ? 'border-[#2b2f36] scale-105 shadow-md'
                      : 'border-white/60 hover:scale-100'
                  }`}
                  aria-label={`Cor ${cIdx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja apagar este cartão?')) {
                    onDelete(cardIndex);
                    onClose();
                  }
                }}
                className="px-3.5 py-3 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold transition flex items-center justify-center"
                title="Excluir"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-white border border-[#e3ded3] text-[#2b2f36] font-bold text-sm hover:bg-stone-50 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#4a7c9d] text-white font-bold text-sm shadow-sm hover:bg-[#3d6884] transition"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
