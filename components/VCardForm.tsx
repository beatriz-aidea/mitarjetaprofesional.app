
import React from 'react';
import { VCardData, CardType } from '../types';
import { User, Briefcase, Phone, Mail, Globe, AlignLeft, Users, ChevronDown, Smartphone, MapPin, Share2 } from 'lucide-react';

interface VCardFormProps {
  data: VCardData;
  onChange: (newData: VCardData) => void;
  cardType: CardType;
}

const COUNTRY_PREFIXES = [
  { code: 'ES', name: 'España', prefix: '+34' },
  { code: 'US', name: 'USA', prefix: '+1' },
  { code: 'MX', name: 'México', prefix: '+52' },
  { code: 'AR', name: 'Argentina', prefix: '+54' },
  { code: 'CO', name: 'Colombia', prefix: '+57' },
  { code: 'CL', name: 'Chile', prefix: '+56' },
  { code: 'PE', name: 'Perú', prefix: '+51' },
  { code: 'VE', name: 'Venezuela', prefix: '+58' },
  { code: 'PT', name: 'Portugal', prefix: '+351' },
  { code: 'FR', name: 'Francia', prefix: '+33' },
  { code: 'IT', name: 'Italia', prefix: '+39' },
  { code: 'DE', name: 'Alemania', prefix: '+49' },
  { code: 'UK', name: 'Reino Unido', prefix: '+44' },
  { code: 'AD', name: 'Andorra', prefix: '+376' },
  { code: 'BR', name: 'Brasil', prefix: '+55' },
];

const InputGroup: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: any;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}> = ({ label, name, value, onChange, icon: Icon, type = "text", placeholder = "", maxLength }) => (
  <div className="mb-4">
    <label className="block text-[10px] lg:text-xs font-semibold text-[#FAF7F5]/50 uppercase tracking-widest mb-2 flex items-center gap-2">
      <Icon size={14} className="text-[#D61E51]" />
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full px-5 py-3 lg:py-4 bg-[#FAF7F5]/5 border border-[#FAF7F5]/10 text-[#FAF7F5] rounded-2xl focus:ring-2 focus:ring-[#D61E51] focus:border-transparent transition-all outline-none placeholder:text-[#FAF7F5]/20 text-base lg:text-base"
    />
  </div>
);

const PhoneInputGroup: React.FC<{
  label: string;
  name: string;
  prefixName: string;
  numberValue: string;
  prefixValue: string;
  onPrefixChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: any;
  placeholder?: string;
  maxLength?: number;
}> = ({ label, name, prefixName, numberValue, prefixValue, onPrefixChange, onNumberChange, icon: Icon, placeholder, maxLength }) => (
  <div className="mb-4">
    <label className="block text-[10px] lg:text-xs font-semibold text-[#FAF7F5]/50 uppercase tracking-widest mb-2 flex items-center gap-2">
      <Icon size={14} className="text-[#D61E51]" />
      {label}
    </label>
    <div className="flex gap-2">
      <div className="relative shrink-0">
        <select
          name={prefixName}
          value={prefixValue}
          onChange={onPrefixChange}
          className="h-full pl-4 pr-10 bg-[#FAF7F5]/5 border border-[#FAF7F5]/10 text-[#FAF7F5] rounded-2xl focus:ring-2 focus:ring-[#D61E51] focus:border-transparent transition-all outline-none appearance-none cursor-pointer text-base lg:text-sm font-bold"
        >
          {COUNTRY_PREFIXES.map((country) => (
            <option key={country.code} value={country.prefix} className="bg-[#0F1022]">
              {country.code} ({country.prefix})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#D61E51]/50">
          <ChevronDown size={14} />
        </div>
      </div>
      <input
        type="tel"
        name={name}
        value={numberValue}
        onChange={onNumberChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="flex-1 min-w-0 px-5 py-3 lg:py-4 bg-[#FAF7F5]/5 border border-[#FAF7F5]/10 text-[#FAF7F5] rounded-2xl focus:ring-2 focus:ring-[#D61E51] focus:border-transparent transition-all outline-none placeholder:text-[#FAF7F5]/20 text-base lg:text-base"
      />
    </div>
  </div>
);

const VCardForm: React.FC<VCardFormProps> = ({ data, onChange, cardType }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Identidad */}
      <div className="bg-[#FAF7F5]/5 p-6 lg:p-8 rounded-[2rem] border border-[#FAF7F5]/10 shadow-sm">
        <h2 className="text-lg lg:text-xl font-bold text-[#FAF7F5] mb-6 lg:mb-8 flex items-center gap-3">
          <User className="text-[#D61E51]" size={20} /> Identidad Profesional
        </h2>
        
        {cardType === 'dynamic' && (
          <div className="mb-8">
            <label className="block text-[10px] lg:text-xs font-semibold text-[#FAF7F5]/50 uppercase tracking-widest mb-2 flex items-center gap-2">
              <User size={14} className="text-[#D61E51]" />
              Foto / Logo (Opcional)
            </label>
            <div className="flex items-center gap-4">
              {data.photo ? (
                <div className="relative">
                  <img src={data.photo} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#D61E51]" />
                  <button 
                    onClick={() => onChange({ ...data, photo: null })}
                    className="absolute -top-1 -right-1 bg-[#D61E51] text-white rounded-full p-1 hover:bg-[#b51844] transition-colors"
                  >
                    <ChevronDown size={12} className="rotate-45" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#FAF7F5]/5 border border-[#FAF7F5]/10 flex items-center justify-center text-[#FAF7F5]/20">
                  <User size={24} />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          let width = img.width;
                          let height = img.height;
                          const maxSize = 400; // Resize to max 400px to keep base64 small
                          
                          if (width > height) {
                            if (width > maxSize) {
                              height *= maxSize / width;
                              width = maxSize;
                            }
                          } else {
                            if (height > maxSize) {
                              width *= maxSize / height;
                              height = maxSize;
                            }
                          }
                          
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            // Compress as JPEG with 0.8 quality
                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                            onChange({ ...data, photo: compressedBase64 });
                          }
                        };
                        img.src = event.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="photo-upload"
                />
                <label 
                  htmlFor="photo-upload"
                  className="inline-block px-4 py-2 bg-[#FAF7F5]/5 border border-[#FAF7F5]/10 rounded-xl text-xs font-bold uppercase tracking-widest text-[#FAF7F5]/70 hover:bg-[#FAF7F5]/10 cursor-pointer transition-all"
                >
                  Subir Imagen
                </label>
                <p className="text-[10px] text-[#FAF7F5]/30 mt-2 font-bold uppercase tracking-widest">
                  Formatos: JPG, PNG. Máx 5MB.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <InputGroup label="Nombre" name="firstName" value={data.firstName} onChange={handleInputChange} icon={User} placeholder="Ej. Javier" />
          <InputGroup label="Apellidos" name="lastName" value={data.lastName} onChange={handleInputChange} icon={User} placeholder="Ej. García" />
          <InputGroup label="Empresa" name="organization" value={data.organization} onChange={handleInputChange} icon={Briefcase} placeholder="Ej. AIDEA Creative" />
          <InputGroup label="Cargo" name="title" value={data.title} onChange={handleInputChange} icon={Briefcase} placeholder="Ej. Director Creativo" />
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-[#FAF7F5]/5 p-6 lg:p-8 rounded-[2rem] border border-[#FAF7F5]/10 shadow-sm">
        <h2 className="text-lg lg:text-xl font-bold text-[#FAF7F5] mb-6 lg:mb-8 flex items-center gap-3">
          <Phone className="text-[#D61E51]" size={20} /> Contacto Digital
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          {/* Left Column in Desktop */}
          <div className="space-y-2">
            <PhoneInputGroup 
              label="Móvil/WhatsApp" 
              name="phoneMobile" 
              prefixName="phoneMobilePrefix"
              numberValue={data.phoneMobile} 
              prefixValue={data.phoneMobilePrefix}
              onNumberChange={handleInputChange}
              onPrefixChange={handleInputChange}
              icon={Smartphone} 
              placeholder="600 000 000"
              maxLength={15}
            />
            <PhoneInputGroup 
              label="Teléfono Fijo" 
              name="phoneWork" 
              prefixName="phoneWorkPrefix"
              numberValue={data.phoneWork} 
              prefixValue={data.phoneWorkPrefix}
              onNumberChange={handleInputChange}
              onPrefixChange={handleInputChange}
              icon={Phone} 
              placeholder="912 000 000"
              maxLength={15}
            />
          </div>
          {/* Right Column in Desktop */}
          <div className="space-y-2">
            <InputGroup label="Email Corporativo" name="email" value={data.email} onChange={handleInputChange} type="email" icon={Mail} placeholder="javier@aidea.com" />
            <InputGroup label="Web / Portfolio" name="url" value={data.url} onChange={handleInputChange} icon={Globe} placeholder="www.aidea.com" />
          </div>
        </div>
      </div>

      {/* Contexto de Red */}
      <div className="bg-[#FAF7F5]/5 p-6 lg:p-8 rounded-[2rem] border border-[#FAF7F5]/10 shadow-sm">
        <h2 className="text-lg lg:text-xl font-bold text-[#FAF7F5] mb-6 lg:mb-8 flex items-center gap-3">
          <Users className="text-[#D61E51]" size={20} /> Contexto de Red
        </h2>
        
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 mb-8">
          <div className="mb-4">
            <InputGroup 
              label="Por qué te pueden recordar" 
              name="customNote" 
              value={data.customNote}
              onChange={handleInputChange} 
              icon={AlignLeft} 
              placeholder="(Tus productos, servicios, proyectos, networking...)" 
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-[-14px]">
              <p className="text-[9px] text-[#FAF7F5]/30 font-bold uppercase tracking-widest">Sé breve, te leerán mejor</p>
              <p className="text-[10px] text-[#FAF7F5]/30 font-bold uppercase tracking-widest">{data.customNote.length}/100</p>
            </div>
          </div>
        </div>
      </div>

      {cardType === 'dynamic' && (
        <>
          {/* Bloque de Dirección */}
          <div className="bg-[#FAF7F5]/5 p-6 lg:p-8 rounded-[2rem] border border-[#FAF7F5]/10 shadow-sm">
            <h2 className="text-lg lg:text-xl font-bold text-[#FAF7F5] mb-6 lg:mb-8 flex items-center gap-3">
              <MapPin className="text-[#D61E51]" size={20} /> Dirección
            </h2>
            <div className="grid grid-cols-1 gap-y-2">
              <InputGroup label="Dirección" name="street" value={data.street || ''} onChange={handleInputChange} icon={MapPin} placeholder="Calle, Número, Piso..." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <InputGroup label="CP" name="zip" value={data.zip || ''} onChange={handleInputChange} icon={MapPin} placeholder="28000" />
                <InputGroup label="Población" name="city" value={data.city || ''} onChange={handleInputChange} icon={MapPin} placeholder="Madrid" />
                <InputGroup label="Provincia" name="state" value={data.state || ''} onChange={handleInputChange} icon={MapPin} placeholder="Madrid" />
                <InputGroup label="País" name="country" value={data.country || ''} onChange={handleInputChange} icon={MapPin} placeholder="España" />
              </div>
            </div>
          </div>

          {/* Bloque de RRSS */}
          <div className="bg-[#FAF7F5]/5 p-6 lg:p-8 rounded-[2rem] border border-[#FAF7F5]/10 shadow-sm">
            <h2 className="text-lg lg:text-xl font-bold text-[#FAF7F5] mb-6 lg:mb-8 flex items-center gap-3">
              <Share2 className="text-[#D61E51]" size={20} /> Redes Sociales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <InputGroup label="LinkedIn" name="linkedin" value={data.linkedin || ''} onChange={handleInputChange} icon={Share2} placeholder="Usuario o URL" />
              <InputGroup label="Instagram" name="instagram" value={data.instagram || ''} onChange={handleInputChange} icon={Share2} placeholder="@usuario" />
              <InputGroup label="X (Twitter)" name="x" value={data.x || ''} onChange={handleInputChange} icon={Share2} placeholder="@usuario" />
              <InputGroup label="TikTok" name="tiktok" value={data.tiktok || ''} onChange={handleInputChange} icon={Share2} placeholder="@usuario" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VCardForm;
