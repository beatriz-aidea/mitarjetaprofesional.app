
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Eye, Lock, Download } from 'lucide-react';
import { VCardData, QRSettings, CardType } from '../types';
import { generateVCardString } from '../services/vCardHelper';

interface QRPreviewProps {
  data: VCardData;
  settings: QRSettings;
  cardType: CardType;
  logoUrl?: string | null;
  dynamicUrl?: string | null;
}

const QRPreview: React.FC<QRPreviewProps> = ({ data, settings, cardType, logoUrl, dynamicUrl }) => {
  // Exclude photo from QR data to prevent size issues/crashes
  // The photo will only be included in the actual vCard file download/email
  const dataForQr = { ...data, photo: null };
  const vCardString = generateVCardString(dataForQr);
  
  // If it's a dynamic card and we have a dynamicUrl, use it. Otherwise use the vCard string.
  const qrValue = (cardType === 'dynamic' && dynamicUrl) ? dynamicUrl : vCardString;

  return (
    <div className="bg-[#FAF7F5] text-[#0F1022] p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center border border-[#FAF7F5]/20 relative overflow-hidden transition-all hover:scale-[1.01]">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[5rem] -mr-10 -mt-10 ${cardType === 'static' ? 'bg-[#D61E51]/10' : 'bg-[#0F1022]/5'}`} />

      <div className="text-center mb-6 relative z-10">
        <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter flex items-center gap-2 justify-center">
          {cardType === 'static' ? <Lock size={20} className="text-[#D61E51]" /> : <Smartphone size={20} className="text-[#0F1022]" />}
          VCard Qr
        </h3>
        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-[#0F1022]/40 uppercase tracking-widest">
           <Eye size={12} /> Previsualización {cardType === 'static' ? 'Estática' : 'Dinámica'}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8 border border-[#0F1022]/5 relative group">
        <div id="qr-code-container">
          <QRCodeSVG
            id="qr-code-svg"
            value={qrValue}
            size={220}
            level="H" 
            bgColor={settings.bgColor}
            fgColor={settings.fgColor}
            includeMargin={settings.includeMargin}
            imageSettings={logoUrl ? {
              src: logoUrl,
              x: undefined,
              y: undefined,
              height: 48,
              width: 48,
              excavate: true,
            } : undefined}
          />
        </div>
        <button 
          onClick={() => {
            const svg = document.getElementById('qr-code-svg');
            if (svg) {
              const svgData = new XMLSerializer().serializeToString(svg);
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const img = new Image();
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `QR_${data.firstName || 'Contacto'}.png`;
                downloadLink.href = `${pngFile}`;
                downloadLink.click();
              };
              img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            }
          }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0F1022] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#D61E51] flex items-center gap-2"
        >
          <Download size={12} /> Descargar QR
        </button>
      </div>

      <div className="w-full space-y-4 relative z-10">
        <div className="bg-[#0F1022]/5 p-5 rounded-2xl border border-[#0F1022]/10">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone size={18} className="text-[#D61E51]" />
            <span className="font-bold text-[10px] uppercase tracking-widest opacity-60">Contenido detectado:</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black truncate uppercase tracking-tighter">
              {data.firstName || 'NOMBRE'} {data.lastName || 'APELLIDOS'}
            </p>
            <p className="text-[10px] text-[#0F1022]/60 uppercase font-bold tracking-tighter">
              {data.organization || 'Sin Empresa'} • {data.title || 'Sin Cargo'}
            </p>
          </div>
        </div>

        {cardType === 'static' && (
          <p className="text-[9px] text-center text-[#0F1022]/40 font-black uppercase tracking-widest leading-relaxed px-4">
            QR Estático e Independiente. No requiere internet para funcionar. Los datos no se guardan.
          </p>
        )}
      </div>
    </div>
  );
};

export default QRPreview;
