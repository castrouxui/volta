import { useRef } from 'react';

export interface StyleOptions {
  mode: 'light' | 'dark';
  color: string;
  typography: 'sans' | 'serif' | 'mono' | 'display';
  logoBase64: string;
  logoMimeType: string;
  logoName: string;
  references: string[];
}

export const DEFAULT_STYLE: StyleOptions = {
  mode: 'light',
  color: 'indigo',
  typography: 'sans',
  logoBase64: '',
  logoMimeType: '',
  logoName: '',
  references: [],
};

const COLORS = [
  { name: 'indigo',   label: 'Índigo',   labelEn: 'Indigo',   hex: '#6366F1' },
  { name: 'blue',     label: 'Azul',     labelEn: 'Blue',     hex: '#3B82F6' },
  { name: 'violet',   label: 'Violeta',  labelEn: 'Violet',   hex: '#8B5CF6' },
  { name: 'teal',     label: 'Teal',     labelEn: 'Teal',     hex: '#14B8A6' },
  { name: 'rose',     label: 'Rosa',     labelEn: 'Rose',     hex: '#F43F5E' },
  { name: 'amber',    label: 'Ámbar',    labelEn: 'Amber',    hex: '#F59E0B' },
  { name: 'emerald',  label: 'Esmeralda',labelEn: 'Emerald',  hex: '#10B981' },
  { name: 'slate',    label: 'Pizarra',  labelEn: 'Slate',    hex: '#64748B' },
];

const TYPOGRAPHY = [
  { id: 'sans',    labelEs: 'Moderno',   labelEn: 'Modern',    subEs: 'Inter, limpio',      subEn: 'Inter, clean',       font: 'system-ui, sans-serif',   weight: '500' },
  { id: 'serif',   labelEs: 'Elegante',  labelEn: 'Elegant',   subEs: 'Playfair, clásico',  subEn: 'Playfair, classic',  font: 'Georgia, serif',          weight: '500' },
  { id: 'mono',    labelEs: 'Técnico',   labelEn: 'Technical', subEs: 'JetBrains, preciso', subEn: 'JetBrains, precise', font: 'monospace',               weight: '600' },
  { id: 'display', labelEs: 'Display',   labelEn: 'Display',   subEs: 'Space Grotesk',      subEn: 'Space Grotesk',      font: 'system-ui, sans-serif',   weight: '800' },
] as const;

const UI = {
  es: {
    mode: 'Modo',
    light: 'Claro',
    dark: 'Oscuro',
    lightSub: 'Fondo blanco',
    darkSub: 'Fondo negro',
    color: 'Color principal',
    typography: 'Tipografía',
    logo: 'Logo',
    upload: 'Subir logo (PNG, SVG, JPG)',
    remove: 'Quitar',
    references: 'Referencias / inspiración',
    add: 'Agregar',
  },
  en: {
    mode: 'Mode',
    light: 'Light',
    dark: 'Dark',
    lightSub: 'White background',
    darkSub: 'Dark background',
    color: 'Primary color',
    typography: 'Typography',
    logo: 'Logo',
    upload: 'Upload logo (PNG, SVG, JPG)',
    remove: 'Remove',
    references: 'References / inspiration',
    add: 'Add',
  },
};

export function buildStyleSuffix(opts: StyleOptions): string {
  const parts: string[] = [];
  parts.push(`Color scheme: ${opts.mode} mode.`);
  parts.push(`Primary color: ${opts.color}.`);
  const typoMap = { sans: 'modern sans-serif', serif: 'elegant serif', mono: 'technical monospace', display: 'bold display' };
  parts.push(`Typography style: ${typoMap[opts.typography]}.`);
  if (opts.logoBase64) parts.push('A logo image is provided — embed it as a base64 <img> and use its visual identity throughout the design.');
  if (opts.references.length > 0) parts.push(`Design inspiration / references: ${opts.references.join(', ')}.`);
  return `\n\nStyle requirements:\n${parts.join(' ')}`;
}

interface StylePanelProps {
  options: StyleOptions;
  onChange: (opts: StyleOptions) => void;
  language?: 'es' | 'en';
}

export function StylePanel({ options, onChange, language = 'es' }: StylePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const refInput = useRef<HTMLInputElement>(null);
  const t = UI[language];

  const set = (patch: Partial<StyleOptions>) => onChange({ ...options, ...patch });

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      set({ logoBase64: base64, logoMimeType: file.type, logoName: file.name });
    };
    reader.readAsDataURL(file);
  };

  const addRef = () => {
    const val = refInput.current?.value.trim();
    if (!val || options.references.includes(val)) return;
    set({ references: [...options.references, val] });
    if (refInput.current) refInput.current.value = '';
  };

  return (
    <div className="mt-3 p-4 bg-white border border-volta-slate-200 rounded-xl space-y-5 animate-fadeIn shadow-sm">

      {/* Mode */}
      <div>
        <p className="text-[11px] font-semibold text-volta-slate-400 mb-2.5 uppercase tracking-widest">{t.mode}</p>
        <div className="grid grid-cols-2 gap-2">
          {/* Light */}
          <button
            onClick={() => set({ mode: 'light' })}
            className={`relative flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left group ${
              options.mode === 'light'
                ? 'border-volta-electric shadow-sm bg-volta-electric/3'
                : 'border-volta-slate-150 hover:border-volta-slate-300 bg-volta-slate-50'
            }`}
          >
            {/* Mini preview */}
            <div className="w-full h-10 rounded-lg mb-2.5 overflow-hidden bg-white border border-volta-slate-100 shadow-sm flex flex-col gap-1 p-1.5">
              <div className="h-1.5 w-3/4 rounded-full bg-volta-slate-200" />
              <div className="h-1.5 w-1/2 rounded-full bg-volta-slate-100" />
              <div className="h-2 w-8 rounded bg-indigo-400 mt-0.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm6.364 2.636a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM21 11h-1a1 1 0 010-2h1a1 1 0 010 2zm-2.636 6.364l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM13 21v-1a1 1 0 01-2 0v1a1 1 0 012 0zM5.636 18.364l-.707.707A1 1 0 013.515 17.657l.707-.707a1 1 0 011.414 1.414zM4 11H3a1 1 0 010-2h1a1 1 0 010 2zm1.636-6.364l-.707-.707A1 1 0 116.343 2.515l.707.707A1 1 0 015.636 4.636zM12 7a5 5 0 100 10A5 5 0 0012 7z"/>
              </svg>
              <span className={`text-xs font-semibold ${options.mode === 'light' ? 'text-volta-electric' : 'text-volta-slate-600'}`}>{t.light}</span>
            </div>
            <span className="text-[10px] text-volta-slate-400 mt-0.5">{t.lightSub}</span>
            {options.mode === 'light' && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-volta-electric flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Dark */}
          <button
            onClick={() => set({ mode: 'dark' })}
            className={`relative flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left group ${
              options.mode === 'dark'
                ? 'border-volta-electric shadow-sm bg-volta-electric/3'
                : 'border-volta-slate-150 hover:border-volta-slate-300 bg-volta-slate-50'
            }`}
          >
            {/* Mini preview */}
            <div className="w-full h-10 rounded-lg mb-2.5 overflow-hidden bg-gray-900 border border-gray-700 shadow-sm flex flex-col gap-1 p-1.5">
              <div className="h-1.5 w-3/4 rounded-full bg-gray-600" />
              <div className="h-1.5 w-1/2 rounded-full bg-gray-700" />
              <div className="h-2 w-8 rounded bg-indigo-500 mt-0.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
              <span className={`text-xs font-semibold ${options.mode === 'dark' ? 'text-volta-electric' : 'text-volta-slate-600'}`}>{t.dark}</span>
            </div>
            <span className="text-[10px] text-volta-slate-400 mt-0.5">{t.darkSub}</span>
            {options.mode === 'dark' && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-volta-electric flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-[11px] font-semibold text-volta-slate-400 mb-2.5 uppercase tracking-widest">{t.color}</p>
        <div className="grid grid-cols-8 gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              title={language === 'es' ? c.label : c.labelEn}
              onClick={() => set({ color: c.name })}
              className="group flex flex-col items-center gap-1"
            >
              <div
                className={`w-8 h-8 rounded-xl shadow-sm transition-all duration-150 ${
                  options.color === c.name
                    ? 'scale-110 ring-2 ring-offset-2 ring-volta-midnight'
                    : 'hover:scale-105 ring-1 ring-black/10'
                }`}
                style={{ backgroundColor: c.hex }}
              />
              <span className={`text-[9px] font-medium leading-none transition-colors ${
                options.color === c.name ? 'text-volta-midnight' : 'text-volta-slate-400'
              }`}>
                {language === 'es' ? c.label.split(',')[0] : c.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <p className="text-[11px] font-semibold text-volta-slate-400 mb-2.5 uppercase tracking-widest">{t.typography}</p>
        <div className="grid grid-cols-2 gap-2">
          {TYPOGRAPHY.map((typ) => (
            <button
              key={typ.id}
              onClick={() => set({ typography: typ.id })}
              className={`relative text-left px-3 py-3 rounded-xl border-2 transition-all bg-white ${
                options.typography === typ.id
                  ? 'border-volta-electric shadow-sm'
                  : 'border-volta-slate-100 hover:border-volta-slate-200 shadow-sm'
              }`}
            >
              <p
                className={`text-base leading-tight mb-1 ${options.typography === typ.id ? 'text-volta-midnight' : 'text-volta-slate-700'}`}
                style={{ fontFamily: typ.font, fontWeight: typ.weight }}
              >
                Aa
              </p>
              <p className={`text-[11px] font-semibold leading-tight ${options.typography === typ.id ? 'text-volta-electric' : 'text-volta-slate-600'}`}>
                {language === 'es' ? typ.labelEs : typ.labelEn}
              </p>
              <p className="text-[10px] text-volta-slate-400 leading-tight mt-0.5">
                {language === 'es' ? typ.subEs : typ.subEn}
              </p>
              {options.typography === typ.id && (
                <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-volta-electric flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div>
        <p className="text-[11px] font-semibold text-volta-slate-400 mb-2.5 uppercase tracking-widest">{t.logo}</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
        {options.logoBase64 ? (
          <div className="flex items-center gap-3 px-3 py-2.5 bg-volta-slate-50 border border-volta-slate-200 rounded-xl">
            <img
              src={`data:${options.logoMimeType};base64,${options.logoBase64}`}
              alt="logo"
              className="h-8 w-auto max-w-[80px] object-contain rounded-lg border border-volta-slate-100 bg-white p-1 shadow-sm"
            />
            <span className="text-xs text-volta-slate-600 truncate max-w-[100px] font-medium">{options.logoName}</span>
            <button
              onClick={() => set({ logoBase64: '', logoMimeType: '', logoName: '' })}
              className="ml-auto text-xs text-volta-slate-400 hover:text-red-500 transition-colors font-medium"
            >
              {t.remove}
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-volta-slate-200 rounded-xl text-xs text-volta-slate-500 hover:border-volta-electric hover:text-volta-electric hover:bg-volta-electric/3 transition-all w-full group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t.upload}
          </button>
        )}
      </div>

      {/* References */}
      <div>
        <p className="text-[11px] font-semibold text-volta-slate-400 mb-2.5 uppercase tracking-widest">{t.references}</p>
        <div className="flex gap-2">
          <input
            ref={refInput}
            type="url"
            placeholder="https://stripe.com"
            className="flex-1 border border-volta-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-volta-electric/30 focus:border-volta-electric transition-all bg-white shadow-sm"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRef())}
          />
          <button
            onClick={addRef}
            className="px-3 py-2 bg-volta-electric text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-sm"
          >
            {t.add}
          </button>
        </div>
        {options.references.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {options.references.map((ref) => (
              <span key={ref} className="flex items-center gap-1 bg-white border border-volta-slate-200 text-volta-slate-600 text-xs px-2.5 py-1 rounded-full shadow-sm">
                {new URL(ref).hostname}
                <button
                  onClick={() => set({ references: options.references.filter((r) => r !== ref) })}
                  className="text-volta-slate-400 hover:text-red-500 ml-0.5 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
