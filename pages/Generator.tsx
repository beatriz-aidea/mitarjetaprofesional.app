
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VCardData, QRSettings, OrderData, CardType } from '../types';
import logoMitarjeta from '../components/logoMItarjetaVCARD_INV.svg';
import VCardForm from '../components/VCardForm';
import QRPreview from '../components/QRPreview';
import { generateVCardString } from '../services/vCardHelper';
import { CreditCard, Smartphone, CheckCircle2, ShoppingCart, Info, Upload, Package, Send, X, Download, Megaphone, ShieldCheck, MessageCircle, ChevronDown, ChevronUp, Lock, PartyPopper, MailCheck } from 'lucide-react';

const PRICING_OPTIONS = [
  { id: '100', label: '100 Tarjetas', price: '22,00 €' },
  { id: '250', label: '250 Tarjetas', price: '28,00 €' },
  { id: '500', label: '500 Tarjetas', price: '35,00 €' },
];

const DYNAMIC_PRICING_OPTIONS = [
  { id: 'pvc_qr', label: 'Tarjetas PVC+Qr', price: '20 €/und.' },
  { id: 'pvc_qr_nfc', label: 'Tarjeta PVC+Qr+Nfc', price: '30 €/und.' },
];

const Generator: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
  };

  const [cardType, setCardType] = useState<CardType>('static');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [dynamicUrl, setDynamicUrl] = useState<string | null>(null);
  const [dynamicQrAccepted, setDynamicQrAccepted] = useState(false);
  const [dynamicError, setDynamicError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showDesignUpload, setShowDesignUpload] = useState(false);
  const [designUrl, setDesignUrl] = useState<string | null>(null);
  const [showDesignInstructions, setShowDesignInstructions] = useState(false);
  const designInputRef = useRef<HTMLInputElement>(null);

  const [vCardData, setVCardData] = useState<VCardData>({
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phoneWork: '',
    phoneWorkPrefix: '+34',
    phoneMobile: '',
    phoneMobilePrefix: '+34',
    email: '',
    url: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    relationship: '',
    customNote: '',
    observations: '',
    linkedin: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    x: ''
  });

  const [orderData, setOrderData] = useState<OrderData>({
    quantity: '100',
    extraInfo: '',
    fileName: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrSettings: QRSettings = {
    fgColor: '#0F1022',
    bgColor: '#FFFFFF',
    level: 'H',
    includeMargin: true,
    size: 1024 
  };

  const handleDataChange = useCallback((newData: VCardData) => {
    setVCardData(newData);
  }, []);

  const saveDynamicQR = async () => {
    setIsSaving(true);
    setDynamicError(null);
    try {
      const response = await fetch('/api/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vCardData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.details || result.error || 'Error al guardar en Airtable');
      }
      
      setDynamicUrl(result.landing_url);
      setVCardData(prev => ({ ...prev, public_id: result.public_id }));
    } catch (error: any) {
      console.error("Error saving dynamic QR:", error);
      setDynamicError(`Error al generar el QR dinámico: ${error.message || 'Inténtalo de nuevo.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLogoUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

    const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setDesignUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = () => {
    if (!privacyAccepted) {
      alert("Debes aceptar el envío de datos para continuar.");
      return;
    }
    if (!vCardData.firstName || !vCardData.email || !vCardData.phoneMobile) {
      alert("Por favor completa los campos básicos de contacto.");
      return;
    }

    const vCardString = generateVCardString(vCardData);
    const subject = encodeURIComponent(`Solicitud VCard QR (${cardType === 'static' ? 'Estática' : 'Dinámica'}) - ${vCardData.firstName} ${vCardData.lastName}`);
    const options = cardType === 'static' ? PRICING_OPTIONS : [...PRICING_OPTIONS, ...DYNAMIC_PRICING_OPTIONS];
    const selectedPricing = options.find(p => p.id === orderData.quantity);
    
    const body = encodeURIComponent(
      `DETALLES DE LA SOLICITUD:\n` +
      `--------------------\n` +
      (vCardData.public_id ? `ID Público: ${vCardData.public_id}\n` : '') +
      `Tipo: Tarjeta Híbrida ${cardType === 'static' ? 'Estática (Datos fijos)' : 'Dinámica (Datos modificables)'}\n` +
      (selectedPricing ? `Cantidad: ${selectedPricing.label} (${selectedPricing.price} + IVA)\n` : '') +
      `Nombre: ${vCardData.firstName} ${vCardData.lastName}\n` +
      `Empresa: ${vCardData.organization}\n` +
      `Email: ${vCardData.email}\n` +
      `Teléfono: ${vCardData.phoneMobilePrefix} ${vCardData.phoneMobile}\n` +
      (vCardData.linkedin ? `LinkedIn: ${vCardData.linkedin}\n` : '') +
      (vCardData.instagram ? `Instagram: ${vCardData.instagram}\n` : '') +
      (vCardData.x ? `X: ${vCardData.x}\n` : '') +
      (vCardData.tiktok ? `TikTok: ${vCardData.tiktok}\n` : '') +
      `Información Extra: ${orderData.extraInfo}\n` +
      `Observaciones: ${vCardData.observations}\n` +
      `Logo Personalizado: ${logoUrl ? 'SÍ (POR FAVOR, ADJUNTE SU LOGO A ESTE CORREO)' : 'NO'}\n` +
      `Diseño Personalizado: ${designUrl ? 'SÍ (POR FAVOR, ADJUNTE SU DISEÑO A ESTE CORREO)' : 'NO'}\n\n` +
      `IMPORTANTE: Adjunte una captura del QR generado y el archivo de diseño (si aplica) para agilizar el proceso.\n\n` +
      (dynamicUrl ? `URL DINÁMICA DEL QR: ${dynamicUrl}\n\n` : '') +
      `DATOS VCARD PARA EL QR:\n` +
      `--------------------\n` +
      `${vCardString}\n\n` +
      `AIDEA @2025`
    );

    window.location.href = `mailto:info@aidea.es?subject=${subject}&body=${body}`;
    
    setTimeout(() => {
      setShowOrderModal(false);
      setShowSuccessModal(true);
    }, 300);
  };

  const getWhatsappLink = () => {
    const vCardString = generateVCardString(vCardData);
    const message = encodeURIComponent(
      `Hola AIDEA, tengo una duda sobre mi VCard QR.\n\n` +
      `Mis datos profesionales para el QR:\n` +
      `--------------------\n` +
      `${vCardString}\n\n` +
      `¿Podéis ayudarme con el diseño/pedido?`
    );
    return `https://wa.me/3491882665?text=${message}`;
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[#0F1022]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#FAF7F5] text-[#0F1022] w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden p-10 lg:p-14 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
             <div className="absolute inset-0 bg-[#D61E51]/10 rounded-full animate-ping" />
             <div className="relative bg-[#D61E51] p-6 rounded-full shadow-lg text-white">
               <CheckCircle2 size={48} />
             </div>
          </div>
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-6">¡Solicitud Enviada!</h3>
        <p className="text-base lg:text-lg leading-relaxed text-[#0F1022]/70 font-medium mb-10">
          Tu información profesional ha sido enviada al equipo de AIDEA. Nos pondremos en contacto contigo rápidamente para gestionar tu QR y enviarte el diseño final.
        </p>
        <button 
          onClick={() => setShowSuccessModal(false)} 
          className="w-full py-5 bg-[#0F1022] text-white font-black text-lg rounded-2xl shadow-xl hover:bg-[#1a1b3a] transition-all uppercase tracking-tighter"
        >
          Cerrar
        </button>
      </div>
    </div>
  );

  const LegalModal = () => (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0F1022]/95 backdrop-blur-md animate-in fade-in zoom-in duration-200">
      <div className="bg-[#FAF7F5] text-[#0F1022] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 lg:p-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Aviso Legal</h3>
            <p className="text-[10px] font-bold text-[#D61E51] uppercase tracking-widest mt-2">Privacidad y Protección de Datos</p>
          </div>
          <button onClick={() => setShowPrivacyModal(false)} className="p-2 hover:bg-[#0F1022]/5 rounded-full transition-colors text-[#D61E51]">
            <X size={28} />
          </button>
        </div>
        <div className="space-y-6 text-sm lg:text-base leading-relaxed text-[#0F1022]/80 font-medium">
          <p>Los datos incluidos en las tarjetas son de <strong>estricto uso profesional</strong> y son gestionados exclusivamente por AIDEA para la creación de sus elementos de comunicación corporativa.</p>
          <p>AIDEA @2025 garantiza la confidencialidad absoluta en el tratamiento de su información.</p>
        </div>
        <button onClick={() => setShowPrivacyModal(false)} className="w-full mt-10 py-5 bg-[#0F1022] text-white font-black text-lg rounded-2xl shadow-xl hover:bg-[#1a1b3a] transition-all uppercase tracking-tighter">Entendido</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1022] text-[#FAF7F5] pb-20 relative">
      <div className="absolute top-6 right-6 z-50">
        {!isLoggedIn ? (
          <Link 
            to="/login"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white transition-all shadow-lg backdrop-blur-md"
          >
            <Lock size={14} className="text-[#D61E51]"/> Acceso usuarios
          </Link>
        ) : (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white/70 hover:bg-[#D61E51]/20 hover:text-[#D61E51] hover:border-[#D61E51]/30 transition-all shadow-lg backdrop-blur-md"
          >
            <Lock size={14} className="text-[#D61E51]"/> Cerrar Sesión
          </button>
        )}
      </div>

      <header className="max-w-4xl mx-auto px-6 py-10 lg:py-16 text-center flex flex-col items-center">
        <img src={logoMitarjeta} alt="Mi Tarjeta VCard Logo" className="h-24 lg:h-36 mb-6" />
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 lg:gap-8 mt-12 lg:mt-16">
           <div className="flex flex-col items-center gap-4 group cursor-pointer w-full md:w-auto">
              <button 
                onClick={() => setCardType('static')}
                className={`px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] transition-all w-full md:w-[14rem] flex items-center justify-center gap-2 ${cardType === 'static' ? 'bg-[#D61E51] text-white shadow-[0_10px_30px_-10px_rgba(214,30,81,0.5)] scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                <Lock size={18} />
                Estática
              </button>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D61E51] italic text-center opacity-80">
                Datos fijos
              </p>
           </div>
           
           <div className="flex flex-col items-center gap-4 group cursor-pointer w-full md:w-auto">
              <button 
                onClick={() => setCardType('dynamic')}
                className={`px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] transition-all w-full md:w-[14rem] flex items-center justify-center gap-2 ${cardType === 'dynamic' ? 'bg-[#D61E51] text-white shadow-[0_10px_30px_-10px_rgba(214,30,81,0.5)] scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
              >
                <Smartphone size={18} />
                Dinámica
              </button>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#D61E51] italic text-center opacity-80">
                Datos modificables
              </p>
           </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-12 lg:space-y-20">
        <section id="form-section">
          <VCardForm data={vCardData} onChange={handleDataChange} cardType={cardType} />
        </section>

        <section id="preview-section" className="flex flex-col items-center">
          <div className="w-full max-w-sm">
            <QRPreview 
              data={vCardData} 
              settings={qrSettings} 
              cardType={cardType} 
              logoUrl={logoUrl} 
              dynamicUrl={dynamicUrl}
            />
            
            {cardType === 'dynamic' && (
              <div className="w-full mt-6 space-y-4">
                {!dynamicUrl && (
                  <label className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={dynamicQrAccepted}
                      onChange={(e) => setDynamicQrAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#D61E51] rounded border-gray-300 focus:ring-[#D61E51]"
                    />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#FAF7F5]/70 leading-relaxed">
                      Acepto el envío de mis datos a AIDEA para la generación del QR dinámico y su almacenamiento seguro.
                    </span>
                  </label>
                )}
                
                <button
                  onClick={saveDynamicQR}
                  disabled={isSaving || (!dynamicUrl && !dynamicQrAccepted)}
                  className="w-full py-4 bg-[#D61E51] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-[#b51844] transition-all shadow-lg disabled:opacity-50 uppercase tracking-widest"
                >
                  {isSaving ? 'Guardando...' : (dynamicUrl ? 'Actualizar Datos en QR' : 'Activar QR Dinámico')}
                </button>

                {dynamicError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                      {dynamicError}
                    </p>
                  </div>
                )}

                {dynamicUrl && !dynamicError && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center flex flex-col gap-2">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      QR Dinámico Activo y Sincronizado
                    </p>
                    <a 
                      href={dynamicUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#D61E51] hover:text-white underline underline-offset-4 transition-colors"
                    >
                      Probar Landing Page (Abrir en nueva pestaña)
                    </a>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 px-6 text-center">
              <p className="text-[10px] font-bold text-[#FAF7F5]/40 uppercase tracking-widest leading-relaxed">
                Recomendaciones para fácil lectura: <br/>
                Tamaño mínimo Qr 2x2 cm. alto contraste fondo/Qr claro/oscuro.
              </p>
            </div>
          </div>

          <div className="mt-8 w-full max-w-sm">
            <button 
              onClick={() => setShowLogoUpload(!showLogoUpload)}
              className="w-full flex items-center justify-between px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-white/40 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <div className="flex items-center gap-2">
                <Upload size={14} />
                Añadir Logo Personalizado <span className="text-[10px] opacity-50 ml-1">(Opcional)</span>
              </div>
              {showLogoUpload ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {showLogoUpload && (
              <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  accept=".svg,.png" 
                  className="hidden" 
                />
                {!logoUrl ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/30 hover:bg-white/5 transition-all"
                  >
                    Seleccionar Logo (SVG/PNG)
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-white/10 p-2 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Logo vinculado</span>
                    </div>
                    <button onClick={() => setLogoUrl(null)} className="text-[#D61E51] p-1"><X size={16} /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tighter leading-tight">
              Tus tarjetas profesionales <br className="hidden md:block"/> están a un click de ti
            </h2>
            {cardType === 'static' && (
              <p className="text-[#D61E51] text-sm lg:text-lg font-bold uppercase tracking-widest">
                Tarjetas Híbridas 85x55 couché 350 gr. Impresión 2 caras
              </p>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 lg:p-12">
            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-8 flex items-center justify-center gap-2">
              <Package size={14} className="text-[#D61E51]" /> Selecciona tu pack para pedir
            </h4>
            
            {cardType === 'dynamic' && (
              <>
                <div className="mt-12 mb-8">
                   <p className="text-[#D61E51] text-[10px] lg:text-xs font-bold uppercase tracking-widest leading-relaxed">
                    Tarjetas dinámicas 85x54 en PVC 840 micras
                  </p>
                </div>
                <div className="flex justify-center mb-12">
                  {DYNAMIC_PRICING_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setOrderData(prev => ({ ...prev, quantity: option.id }));
                        setPrivacyAccepted(false);
                        setShowOrderModal(true);
                      }}
                      className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all w-full md:w-64 ${
                        orderData.quantity === option.id 
                        ? 'bg-[#D61E51] border-[#D61E51] text-white shadow-2xl scale-105' 
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-black text-lg mb-1">{option.label}</span>
                      <span className="text-2xl font-black">{option.price}</span>
                      <div className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter opacity-70">
                        <ShoppingCart size={12} /> Pedir ahora
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {cardType === 'dynamic' && (
              <p className="text-[#D61E51] text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-8">
                Tarjetas dinámicas 85x55 couché 350 gr. Impresión 2 caras
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRICING_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setOrderData(prev => ({ ...prev, quantity: option.id }));
                    setPrivacyAccepted(false);
                    setShowOrderModal(true);
                  }}
                  className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all ${
                    orderData.quantity === option.id 
                    ? 'bg-[#D61E51] border-[#D61E51] text-white shadow-2xl scale-105' 
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="font-black text-lg mb-1">{option.label}</span>
                  <span className="text-2xl font-black">{option.price}</span>
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter opacity-70">
                    <ShoppingCart size={12} /> Pedir ahora
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-white/30">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#D61E51]" /> IVA NO INCLUIDO</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#D61E51]" /> PORTES INCLUIDOS</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#D61E51]" /> ENTREGA 7/10 DÍAS</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <a 
              href={getWhatsappLink()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full max-w-md py-6 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all uppercase tracking-tighter"
            >
              <MessageCircle size={22} className="text-[#25D366]" />
              ¿Tienes dudas? ¡Escríbenos!
            </a>
          </div>
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-6 pt-20 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex justify-center gap-10 text-[10px] font-bold uppercase tracking-widest text-white/30">
            <a href="mailto:info@aidea.es" className="hover:text-[#D61E51] transition-colors">info@aidea.es</a>
            <button onClick={() => setShowPrivacyModal(true)} className="hover:text-[#D61E51] transition-colors">Aviso Legal</button>
          </div>
          <p className="text-sm font-black tracking-[0.3em] text-white/40 uppercase">AIDEA @2025</p>
        </div>
      </footer>

      {/* Modals */}
      {showPrivacyModal && <LegalModal />}
      {showSuccessModal && <SuccessModal />}
      {showOrderModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0F1022]/95 backdrop-blur-md">
          <div className="bg-[#FAF7F5] text-[#0F1022] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-[#0F1022]/5 flex justify-between items-center bg-[#FAF7F5]">
              <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
                Confirmar Pedido
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="p-2 text-[#D61E51]"><X size={28} /></button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
              <div className="bg-[#0F1022]/5 p-5 rounded-2xl border border-[#0F1022]/10">
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info size={14} className="text-[#D61E51]" /> Comentarios Adicionales
                </label>
                <textarea
                  value={orderData.extraInfo}
                  onChange={(e) => setOrderData(prev => ({ ...prev, extraInfo: e.target.value }))}
                  placeholder="¿Alguna instrucción especial para AIDEA?"
                  className="w-full p-4 bg-white border border-[#0F1022]/10 rounded-xl outline-none focus:ring-2 focus:ring-[#D61E51] transition-all text-sm h-24 resize-none"
                />
              </div>

              <div className="bg-[#0F1022]/5 p-5 rounded-2xl border border-[#0F1022]/10">
                 <div className="flex items-center justify-between mb-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Upload size={14} className="text-[#D61E51]" /> Añadir Diseño (Opcional)
                    </label>
                    <button 
                      onClick={() => setShowDesignInstructions(!showDesignInstructions)}
                      className="text-[10px] font-bold text-[#D61E51] underline uppercase tracking-widest"
                    >
                      Ver instrucciones
                    </button>
                 </div>
                 
                 {showDesignInstructions && (
                   <div className="mb-4 p-3 bg-[#D61E51]/5 border border-[#D61E51]/20 rounded-xl text-[10px] text-[#0F1022]/70 leading-relaxed animate-in fade-in slide-in-from-top-2">
                     El formato del archivo tiene que ser 85x55 mm con 2 mm. (89x59) de sangrado con las fuentes contorneadas o en jpg o png con 150ppp mínimo. Si tienes dudas, consulta con nosotros y te ayudaremos.
                   </div>
                 )}

                 <input 
                    type="file" 
                    ref={designInputRef} 
                    onChange={handleDesignUpload} 
                    accept=".pdf,.jpg,.png,.ai,.eps" 
                    className="hidden" 
                  />
                  {!designUrl ? (
                    <button 
                      onClick={() => designInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-[#0F1022]/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0F1022]/30 hover:bg-[#0F1022]/5 transition-all"
                    >
                      Subir Diseño
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-[#0F1022]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0F1022]/5 rounded flex items-center justify-center">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-bold text-[#0F1022]/60 uppercase tracking-tighter">Diseño adjunto</span>
                      </div>
                      <button onClick={() => setDesignUrl(null)} className="text-[#D61E51] p-1"><X size={16} /></button>
                    </div>
                  )}
              </div>
              
              <div className="bg-[#D61E51]/5 p-5 rounded-2xl border border-[#D61E51]/20">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>PACK: {PRICING_OPTIONS.find(p => p.id === orderData.quantity)?.label || DYNAMIC_PRICING_OPTIONS.find(p => p.id === orderData.quantity)?.label}</span>
                  <span className="text-[#D61E51]">{PRICING_OPTIONS.find(p => p.id === orderData.quantity)?.price || DYNAMIC_PRICING_OPTIONS.find(p => p.id === orderData.quantity)?.price}</span>
                </div>
              </div>

              <div className="p-6 bg-white rounded-3xl border-2 border-[#D61E51]/10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={16} className="text-[#D61E51]" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#D61E51]">Gestión de Datos AIDEA</span>
                </div>
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-6 h-6 border-2 border-[#D61E51]/20 rounded-lg bg-white checked:bg-[#D61E51] checked:border-[#D61E51] transition-all cursor-pointer"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    />
                    <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0F1022]/80 leading-snug group-hover:text-[#0F1022] transition-colors">
                    Acepto el envío de datos profesionales. Entiendo que los datos serán utilizados para el uso comercial y gestión de pedidos de AIDEA exclusivamente.
                  </span>
                </label>
              </div>
            </div>
            <div className="p-8 bg-[#FAF7F5] border-t border-[#0F1022]/5">
              <button
                disabled={!privacyAccepted}
                onClick={handleFinalSubmit}
                className="w-full py-5 bg-[#0F1022] text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-[#1a1b3a] transition-all shadow-xl active:scale-[0.98] uppercase tracking-tighter disabled:opacity-30 disabled:grayscale"
              >
                <Send size={20} />
                Enviar Solicitud a AIDEA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
