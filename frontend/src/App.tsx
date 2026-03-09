import { useState } from 'react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (error) {
      console.error('Error:', error);
      setGeneratedCode('Error generating website. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            <span className="text-indigo-600">Volta</span>
          </h1>
          <p className="text-slate-600 mt-2">Transform ideas into websites</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Describe Your Website
            </h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A portfolio website for a UX designer specializing in AI products. Modern, minimal design with case studies and contact form."
              className="w-full h-40 p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating...' : 'Generate Website'}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Generated Code
            </h2>
            {generatedCode ? (
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto h-40 text-sm font-mono">
                {generatedCode}
              </pre>
            ) : (
              <p className="text-slate-500 text-center py-20">
                Your generated code will appear here
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
