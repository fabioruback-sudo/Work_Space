import React, { useState } from 'react';
import { Header } from './components/Header';
import { UrlForm } from './components/UrlForm';
import { BlueprintDashboard } from './components/BlueprintDashboard';
import { analyzeWebsite } from './services/gemini';
import { SiteBlueprint } from './types';
import { AlertCircle, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<SiteBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setBlueprint(null);

    try {
      const result = await analyzeWebsite(url);
      setBlueprint(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while analyzing the website.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <UrlForm onSubmit={handleAnalyze} isLoading={isLoading} />

        {error && (
          <div className="max-w-3xl mx-auto px-4 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Analysis Failed</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="max-w-3xl mx-auto px-4 mb-12 flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-200 rounded-full blur-xl animate-pulse-fast opacity-50"></div>
              <Loader2 className="w-12 h-12 text-brand-600 animate-spin relative z-10" />
            </div>
            <p className="mt-6 text-lg font-medium text-slate-600 animate-pulse">
              Extracting site structure and pertinent information...
            </p>
            <p className="text-sm text-slate-400 mt-2">This usually takes 10-15 seconds.</p>
          </div>
        )}

        {blueprint && !isLoading && (
          <BlueprintDashboard blueprint={blueprint} />
        )}
      </main>
    </div>
  );
};

export default App;
