import React, { useState, useRef } from 'react';
import { X, Camera, Trash2, User } from 'lucide-react';

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
    if (!name.trim()) return;
    onSave(name.trim(), photo);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-[#f6f3ec] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#e3ded3]">
          <h3 className="text-xl font-bold text-[#2b2f36] flex items-center gap-2">
            <span>👤 Perfil da Criança</span>
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#e3ded3] text-[#7a7f87] hover:text-[#2b2f36]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Avatar display & actions */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-stone-100 flex items-center justify-center overflow-hidden">
                {photo ? (
                  <img src={photo} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-[#7a7f87]" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#4a7c9d] text-white shadow-md hover:bg-[#3d6884] transition"
                title="Trocar foto"
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
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-[#e3ded3] text-[#2b2f36] hover:bg-stone-50"
              >
                Escolher foto
              </button>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto(undefined)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remover
                </button>
              )}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-bold text-[#7a7f87] mb-1 uppercase tracking-wider">
              Nome da criança
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Thales"
              className="w-full rounded-xl bg-white border border-[#e3ded3] px-3.5 py-3 text-base font-bold text-[#2b2f36] outline-none focus:border-[#4a7c9d]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
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
