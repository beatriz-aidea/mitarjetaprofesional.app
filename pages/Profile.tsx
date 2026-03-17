import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VCardData } from '../types';
import { Download } from 'lucide-react';

const Profile: React.FC = () => {
  const { public_id } = useParams<{ public_id: string }>();
  const [profile, setProfile] = useState<VCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${public_id}`);
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
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-[#FAF7F5]/60">The link you followed is invalid or has expired.</p>
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

          {/* Action Button */}
          <a
            href={`/api/profile/${public_id}/vcard`}
            className="w-full py-4 bg-[#D61E51] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-[#b51844] transition-all shadow-lg uppercase tracking-widest"
          >
            <Download size={18} />
            Add Contact
          </a>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-[10px] font-black tracking-[0.3em] text-[#FAF7F5]/30 uppercase">
          mitarjetaprofesional.app
        </p>
      </div>
    </div>
  );
};

export default Profile;
