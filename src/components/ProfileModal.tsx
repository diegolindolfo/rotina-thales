import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Trash2, User } from 'lucide-react';
import { cropImageFileToDataUrl } from '../utils/image';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentPhoto?: string;
  onSave: (name: string, photo?: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentName,
  currentPhoto,
  onSave,
}) => {
  const [name, setName] = useState(currentName);
  const [photo, setPhoto] = useState<string | undefined>(currentPhoto);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form with current values every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setPhoto(currentPhoto);
    }
  }, [isOpen, currentName, currentPhoto]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    if (!name.trim()) return;
    onSave(name.trim(), photo);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#f6f3ec] border border-[#e2dcd0] p-5 sm:p-6 shadow-2xl animate-modal-in">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#e2dcd0]">
          <h3
            id="profile-modal-title"
            className="text-xl font-extrabold text-[#252a31] flex items-center gap-2"
          >
            <span>👤 Perfil da Criança</span>
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

        <form onSubmit={handleSubmit} className="space-y-5 pt-5">
          {/* Avatar display & actions */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center overflow-hidden">
                {photo ? (
                  <img src={photo} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-[#6b717b]" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#3f7396] text-white shadow-md hover:bg-[#335f7d] transition cursor-pointer"
                title="Trocar foto"
                aria-label="Trocar foto"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-extrabold px-3.5 py-2 rounded-xl bg-white border border-[#e2dcd0] text-[#252a31] hover:bg-[#efeae0]/60 transition cursor-pointer"
              >
                Escolher foto
              </button>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto(undefined)}
                  className="text-xs font-extrabold px-3.5 py-2 rounded-xl bg-[#fdeceb] text-[#c03a2b] hover:bg-red-100 flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remover
                </button>
              )}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-extrabold text-[#6b717b] mb-1.5 uppercase tracking-wider">
              Nome da criança
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Thales"
              className="w-full rounded-xl bg-white border border-[#e2dcd0] px-3.5 py-3 text-base font-extrabold text-[#252a31] outline-none focus:border-[#3f7396] focus:ring-2 focus:ring-[#3f7396]/15 transition"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 pt-2">
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

