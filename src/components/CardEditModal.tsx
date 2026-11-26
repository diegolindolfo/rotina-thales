import React, { useState, useRef, useEffect } from 'react';
import {
  RoutineCard,
  CARD_COLORS,
  CARD_COLOR_NAMES,
  ROUTINE_EMOJIS,
  ROUTINE_ILLUSTRATIONS,
  RoutineBlockId,
  getBlocksForDay,
  getCardBlockId,
  getCardImageSrc,
  resolveCardIllustrationId,
} from '../types/routine';
import { uid } from '../utils/storage';
import { cropImageFileToDataUrl } from '../utils/image';
import { X, Trash2, Camera, Check } from 'lucide-react';

interface CardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardIndex: number | null; // -1 or null for new card
  initialCard?: RoutineCard;
  defaultTime?: string;
  isWeekend?: boolean;
  onSave: (card: RoutineCard, index: number | null) => void;
  onDelete?: (index: number) => void;
}

export const CardEditModal: React.FC<CardEditModalProps> = ({
  isOpen,
  onClose,
  cardIndex,
  initialCard,
  defaultTime = '08:00',
  isWeekend = false,
  onSave,
  onDelete,
}) => {
  const [time, setTime] = useState(initialCard?.t || defaultTime);
  const [title, setTitle] = useState(initialCard?.x || '');
  const [emoji, setEmoji] = useState(initialCard?.e || '⭐');
  const [colorIdx, setColorIdx] = useState(initialCard?.c ?? 0);
  const [photo, setPhoto] = useState<string | undefined>(initialCard?.p);
  const [illustration, setIllustration] = useState<string | undefined>(initialCard?.i);
  const [block, setBlock] = useState<RoutineBlockId | undefined>(initialCard?.b);

  useEffect(() => {
    if (isOpen) {
      setTime(initialCard?.t || defaultTime);
      setTitle(initialCard?.x || '');
      setEmoji(initialCard?.e || '⭐');
      setColorIdx(initialCard?.c ?? 0);
      setPhoto(initialCard?.p);
      setIllustration(initialCard?.i);
      setBlock(initialCard?.b);
    }
  }, [isOpen, initialCard, defaultTime]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const dataUrl = await cropImageFileToDataUrl(file, 240);
      setPhoto(dataUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível ler a imagem selecionada.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard: RoutineCard = {
      id: initialCard?.id || uid(),
      t: time || '08:00',
      x: title.trim() || 'Nova atividade',
      e: emoji.trim() || '⭐',
      c: colorIdx % CARD_COLORS.length,
      p: photo || undefined,
      ...(illustration ? { i: illustration } : {}),
      b: block,
    };
    onSave(newCard, cardIndex);
    onClose();
  };

  const isEditing = cardIndex !== null && cardIndex >= 0;
  const availableBlocks = getBlocksForDay(isWeekend);
  const autoBlockId = getCardBlockId(time || '08:00', isWeekend);
  const autoBlockLabel =
    availableBlocks.find((b) => b.id === autoBlockId)?.label || 'Horário';
  const previewImageSrc = getCardImageSrc({ p: photo, i: illustration, x: title, e: emoji });
  const activeIllustrationId = photo
    ? undefined
    : resolveCardIllustrationId({ i: illustration, x: title, e: emoji });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-edit-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#f6f3ec] border border-[#e2dcd0] p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e2dcd0]">
          <h3
            id="card-edit-modal-title"
            className="text-xl font-extrabold text-[#252a31] flex items-center gap-2"
          >
            <span>{isEditing ? '✏️ Editar Atividade' : '➕ Nova Atividade'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#e2dcd0] text-[#6b717b] hover:text-[#252a31] hover:bg-[#efeae0]/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Time & Title Row */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <label className="block text-xs font-extrabold text-[#6b717b] mb-1.5 uppercase tracking-wider">
                Horário
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full rounded-xl bg-white border border-[#e2dcd0] px-3 py-2.5 text-base sm:text-lg font-extrabold font-mono tabular-nums text-[#252a31] outline-none focus:border-[#3f7396] focus:ring-2 focus:ring-[#3f7396]/15 transition"
              />
            </div>
            <div className="col-span-8">
              <label className="block text-xs font-extrabold text-[#6b717b] mb-1.5 uppercase tracking-wider">
                Nome da atividade
              </label>
              <input
                type="text"
                placeholder="Ex.: Banho, Almoço..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl bg-white border border-[#e2dcd0] px-3.5 py-2.5 text-base font-bold text-[#252a31] outline-none focus:border-[#3f7396] focus:ring-2 focus:ring-[#3f7396]/15 transition"
              />
            </div>
          </div>

          {/* Routine Block */}
          <div>
            <label className="block text-xs font-extrabold text-[#6b717b] mb-1.5 uppercase tracking-wider">
              Período da Rotina
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setBlock(undefined)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                  block === undefined
                    ? 'bg-[#3f7396] text-white border-[#3f7396] shadow-2xs'
                    : 'bg-white border-[#e2dcd0] text-[#252a31] hover:bg-[#efeae0]/60'
                }`}
              >
                Automático ({autoBlockLabel})
              </button>
              {availableBlocks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBlock(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition flex items-center gap-1.5 cursor-pointer ${
                    block === b.id
                      ? 'bg-[#3f7396] text-white border-[#3f7396] shadow-2xs'
                      : 'bg-white border-[#e2dcd0] text-[#252a31] hover:bg-[#efeae0]/60'
                  }`}
                >
                  <span>{b.emoji}</span>
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Photo (Optional) */}
          <div className="rounded-2xl bg-white p-3.5 border border-[#e2dcd0]">
            <label className="block text-xs font-extrabold text-[#6b717b] mb-2 uppercase tracking-wider">
              Imagem do Cartão (Prévia)
            </label>
            <div className="flex items-center gap-3.5">
              <div
                style={{ backgroundColor: CARD_COLORS[colorIdx % CARD_COLORS.length] }}
                className="w-16 h-16 rounded-2xl border border-black/10 flex items-center justify-center overflow-hidden flex-none shadow-2xs"
              >
                {previewImageSrc ? (
                  <img src={previewImageSrc} alt="Prévia" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl leading-none">{emoji}</span>
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
                  className="px-3.5 py-2 rounded-xl bg-[#dfeef8] text-[#3f7396] text-xs font-extrabold hover:bg-[#d0e5f4] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  {photo ? 'Trocar foto' : 'Enviar foto'}
                </button>
                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto(undefined)}
                    className="px-3.5 py-2 rounded-xl bg-[#fdeceb] text-[#c03a2b] text-xs font-extrabold hover:bg-red-100 transition cursor-pointer"
                  >
                    Remover foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Built-in Thales Illustrations */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold text-[#6b717b] uppercase tracking-wider">
                Ilustrações do Thales
              </label>
              <button
                type="button"
                onClick={() => {
                  setIllustration('none');
                  setPhoto(undefined);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition cursor-pointer ${
                  !photo && !activeIllustrationId
                    ? 'bg-[#3f7396] text-white border-[#3f7396]'
                    : 'bg-white border-[#e2dcd0] text-[#6b717b] hover:text-[#252a31] hover:bg-[#efeae0]/60'
                }`}
              >
                Usar emoji
              </button>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 p-2 rounded-2xl bg-white border border-[#e2dcd0]">
              {ROUTINE_ILLUSTRATIONS.map((item) => {
                const isSelected = !photo && activeIllustrationId === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setIllustration(item.id);
                      setPhoto(undefined);
                    }}
                    title={item.label}
                    aria-label={item.label}
                    aria-pressed={isSelected}
                    className={`group flex flex-col items-center p-1 rounded-2xl border-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-[#3f7396] bg-[#dfeef8] scale-103 shadow-2xs'
                        : 'border-transparent hover:bg-[#f6f3ec]'
                    }`}
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <span className="mt-1 text-[10px] font-bold text-[#252a31] leading-tight text-center line-clamp-1">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emoji / Symbol */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold text-[#6b717b] uppercase tracking-wider">
                Ícone / Emoji
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#6b717b]">Outro emoji:</span>
                <input
                  type="text"
                  value={emoji}
                  maxLength={10}
                  onChange={(e) => {
                    setEmoji(e.target.value);
                    setIllustration('none');
                  }}
                  aria-label="Emoji personalizado"
                  className="w-14 h-9 text-center text-xl rounded-xl bg-white border border-[#e2dcd0] focus:border-[#3f7396] outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-2xl bg-white border border-[#e2dcd0]">
              {ROUTINE_EMOJIS.map((eItem, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setEmoji(eItem);
                    setIllustration('none');
                  }}
                  className={`h-10 text-2xl flex items-center justify-center rounded-xl border-2 transition cursor-pointer ${
                    emoji === eItem && !activeIllustrationId
                      ? 'border-[#3f7396] bg-[#dfeef8] scale-105'
                      : 'border-transparent hover:bg-[#f6f3ec]'
                  }`}
                >
                  {eItem}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <label className="block text-xs font-extrabold text-[#6b717b] mb-2 uppercase tracking-wider">
              Cor do Cartão
            </label>
            <div className="grid grid-cols-6 gap-2">
              {CARD_COLORS.map((bgHex, cIdx) => {
                const isSelected = colorIdx === cIdx;
                return (
                  <button
                    type="button"
                    key={cIdx}
                    onClick={() => setColorIdx(cIdx)}
                    style={{ backgroundColor: bgHex }}
                    className={`h-11 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#252a31] scale-105 shadow-sm ring-2 ring-[#252a31]/15'
                        : 'border-black/10 hover:border-black/25'
                    }`}
                    title={CARD_COLOR_NAMES[cIdx]}
                    aria-label={`Cor ${CARD_COLOR_NAMES[cIdx]}`}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <Check className="w-4 h-4 text-[#252a31] stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2.5">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja apagar esta atividade?')) {
                    onDelete(cardIndex);
                    onClose();
                  }
                }}
                className="px-4 py-3 rounded-xl bg-white border border-red-200 text-[#c03a2b] hover:bg-[#fdeceb] font-extrabold transition flex items-center justify-center cursor-pointer"
                title="Excluir atividade"
                aria-label="Excluir atividade"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-white border border-[#e2dcd0] text-[#252a31] font-extrabold text-sm hover:bg-[#efeae0]/60 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-[#3f7396] text-white font-extrabold text-sm shadow-xs hover:bg-[#335f7d] transition cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

