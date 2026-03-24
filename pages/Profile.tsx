import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VCardData } from '../types';
import { Download, Share2, Check } from 'lucide-react';

const Profile: React.FC = () => {
  const { public_id } = useParams<{ public_id: string }>();
  const [profile, setProfile] = useState<VCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/perfil/${public_id}`);
        if (!response.ok) {
          throw new Error('Profile not found');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (public_id) {
      fetchProfile();
    }
  }, [public_id]);

  const handleShare = async () => {
    const shareData = {
      title: `${profile?.firstName} ${profile?.lastName} - Tarjeta Profesional`,
      text: `Guarda mi contacto profesional: ${profile?.firstName} ${profile?.lastName}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1022] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D61E51]"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0F1022] flex items-center justify-center text-[#FAF7F5]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Perfil no encontrado</h2>
          <p className="text-[#FAF7F5]/60">El enlace que has seguido no es válido o ha expirado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1022] text-[#FAF7F5] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[#FAF7F5]/5 border border-[#FAF7F5]/10 rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Top Accent Bar */}
        <div className="h-3 w-full bg-gradient-to-r from-[#D61E51] to-[#8a1334]"></div>

        {/* Info */}
        <div className="pt-10 pb-12 px-6 text-center">
          <h1 className="text-3xl font-black tracking-tight mb-2">
            {profile.firstName} {profile.lastName}
          </h1>
          {profile.title && (
            <p className="text-[#D61E51] font-bold text-sm uppercase tracking-widest mb-2">
              {profile.title}
            </p>
          )}
          {profile.organization && (
            <p className="text-[#FAF7F5]/60 font-medium text-base mb-8">
              {profile.organization}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <a
              href={`/api/perfil/${public_id}/vcard?t=${Date.now()}`}
              className="w-full py-4 bg-[#D61E51] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-[#b51844] transition-all shadow-lg uppercase tracking-widest"
            >
              <Download size={18} />
              Añadir Contacto
            </a>
            
            <button
              onClick={handleShare}
              className="w-full py-4 bg-[#FAF7F5]/10 text-[#FAF7F5] font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FAF7F5]/20 transition-all uppercase tracking-widest"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
              {copied ? '¡Enlace copiado!' : 'Compartir Perfil'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center flex flex-col items-center gap-2">
        <p className="text-[10px] font-black tracking-[0.3em] text-[#FAF7F5]/30 uppercase">
          mitarjetaprofesional.com
        </p>
        <a 
          href="https://www.aidea.es" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-black tracking-[0.3em] text-white/40 uppercase hover:text-[#D61E51] transition-colors"
        >
          AIDEA @2025
        </a>
      </div>
    </div>
  );
};

export default Profile;
