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
  { name: 'indigo', label: 'Indigo', hex: '#6366F1' },
  { name: 'blue', label: 'Blue', hex: '#3B82F6' },
  { name: 'violet', label: 'Violet', hex: '#8B5CF6' },
  { name: 'teal', label: 'Teal', hex: '#14B8A6' },
  { name: 'rose', label: 'Rose', hex: '#F43F5E' },
  { name: 'amber', label: 'Amber', hex: '#F59E0B' },
  { name: 'emerald', label: 'Emerald', hex: '#10B981' },
  { name: 'slate', label: 'Slate', hex: '#64748B' },
];

const TYPOGRAPHY = [
  { id: 'sans', label: 'Modern', sub: 'Inter, clean' },
  { id: 'serif', label: 'Elegant', sub: 'Playfair, classic' },
  { id: 'mono', label: 'Technical', sub: 'JetBrains, precise' },
  { id: 'display', label: 'Bold', sub: 'Space Grotesk' },
] as const;

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
}

export function StylePanel({ options, onChange }: StylePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const refInput = useRef<HTMLInputElement>(null);

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
    <div className="mt-3 p-4 bg-volta-slate-50 border border-volta-slate-200 rounded-xl space-y-4 animate-fadeIn">

      {/* Mode */}
      <div>
        <p className="text-xs font-medium text-volta-slate-500 mb-2 uppercase tracking-wide">Mode</p>
        <div className="flex gap-2">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              onClick={() => set({ mode: m })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                options.mode === m
                  ? 'border-volta-electric bg-volta-electric text-white'
                  : 'border-volta-slate-200 text-volta-slate-600 hover:border-volta-slate-300'
              }`}
            >
              {m === 'light' ? '☀️' : '🌙'} {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs font-medium text-volta-slate-500 mb-2 uppercase tracking-wide">Primary color</p>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c.name}
              title={c.label}
              onClick={() => set({ color: c.name })}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                options.color === c.name ? 'border-volta-midnight scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <p className="text-xs font-medium text-volta-slate-500 mb-2 uppercase tracking-wide">Typography</p>
        <div className="grid grid-cols-4 gap-1.5">
          {TYPOGRAPHY.map((t) => (
            <button
              key={t.id}
              onClick={() => set({ typography: t.id })}
              className={`text-left px-2.5 py-2 rounded-lg border transition-all ${
                options.typography === t.id
                  ? 'border-volta-electric bg-volta-electric/5 text-volta-electric'
                  : 'border-volta-slate-200 text-volta-slate-600 hover:border-volta-slate-300'
              }`}
            >
              <p className="text-xs font-semibold leading-tight">{t.label}</p>
              <p className="text-[10px] text-volta-slate-400 leading-tight mt-0.5">{t.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Logo */}
      <div>
        <p className="text-xs font-medium text-volta-slate-500 mb-2 uppercase tracking-wide">Logo</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
        {options.logoBase64 ? (
          <div className="flex items-center gap-2">
            <img
              src={`data:${options.logoMimeType};base64,${options.logoBase64}`}
              alt="logo"
              className="h-8 w-auto max-w-[80px] object-contain rounded border border-volta-slate-200 bg-white p-1"
            />
            <span className="text-xs text-volta-slate-500 truncate max-w-[100px]">{options.logoName}</span>
            <button
              onClick={() => set({ logoBase64: '', logoMimeType: '', logoName: '' })}
              className="ml-auto text-xs text-volta-slate-400 hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 border border-dashed border-volta-slate-300 rounded-lg text-xs text-volta-slate-500 hover:border-volta-electric hover:text-volta-electric transition-all w-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload logo (PNG, SVG, JPG)
          </button>
        )}
      </div>

      {/* References */}
      <div>
        <p className="text-xs font-medium text-volta-slate-500 mb-2 uppercase tracking-wide">References / inspiration</p>
        <div className="flex gap-2">
          <input
            ref={refInput}
            type="url"
            placeholder="https://stripe.com"
            className="flex-1 border border-volta-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-volta-electric/30 focus:border-volta-electric transition-all"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRef())}
          />
          <button
            onClick={addRef}
            className="px-3 py-1.5 bg-volta-electric text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </div>
        {options.references.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {options.references.map((ref) => (
              <span key={ref} className="flex items-center gap-1 bg-white border border-volta-slate-200 text-volta-slate-600 text-xs px-2 py-1 rounded-full">
                {new URL(ref).hostname}
                <button onClick={() => set({ references: options.references.filter((r) => r !== ref) })} className="text-volta-slate-400 hover:text-red-500 ml-0.5">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
