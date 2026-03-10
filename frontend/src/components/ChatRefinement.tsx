import { useState, useRef, KeyboardEvent } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatRefinementProps {
  onRefine: (instruction: string) => void;
  isGenerating: boolean;
  isPro: boolean;
  onUpgradeClick: () => void;
}

const QUICK_PROMPTS = [
  'Make the color scheme darker',
  'Add a pricing section',
  'Change the font to serif',
  'Make it more minimalist',
  'Add animations',
  'Improve mobile layout',
];

export function ChatRefinement({ onRefine, isGenerating, isPro, onUpgradeClick }: ChatRefinementProps) {
  const [instruction, setInstruction] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!instruction.trim() || isGenerating || !isPro) return;
    const msg: Message = { role: 'user', content: instruction, timestamp: new Date() };
    setHistory((prev) => [...prev, msg]);
    onRefine(instruction);
    setInstruction('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isPro) {
    return (
      <div className="border border-volta-slate-200 rounded-xl p-4 mt-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-volta-electric to-volta-spark flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-volta-midnight">Chat Refinement</p>
            <p className="text-xs text-volta-slate-500 mt-0.5">
              Iterate on your website with natural language — Pro feature
            </p>
            <button
              onClick={onUpgradeClick}
              className="mt-2 text-xs font-semibold text-volta-electric hover:text-volta-spark transition-colors"
            >
              Upgrade to Pro →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-volta-slate-200 rounded-xl overflow-hidden mt-4">
      <div className="px-4 py-2.5 border-b border-volta-slate-100 bg-volta-slate-50 flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-volta-electric to-volta-spark flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-volta-slate-700">Refine with chat</p>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="max-h-32 overflow-y-auto p-3 space-y-2">
          {history.map((msg, i) => (
            <div
              key={i}
              className={`text-xs px-2.5 py-1.5 rounded-lg max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-volta-electric text-white ml-auto'
                  : 'bg-volta-slate-100 text-volta-slate-700'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      )}

      {/* Quick prompts */}
      {history.length === 0 && (
        <div className="p-3 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => setInstruction(p)}
              className="text-xs px-2.5 py-1 rounded-full border border-volta-slate-200 text-volta-slate-600 hover:border-volta-electric/50 hover:text-volta-electric hover:bg-volta-electric/5 transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-3 pb-3">
        <input
          ref={inputRef}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Make the hero section full-screen..."
          disabled={isGenerating}
          className="flex-1 text-sm border border-volta-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volta-electric/30 focus:border-volta-electric transition-all disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={!instruction.trim() || isGenerating}
          className="p-2 bg-volta-electric text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {isGenerating ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
