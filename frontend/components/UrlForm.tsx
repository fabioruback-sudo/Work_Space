import React, { useState } from 'react';
import { Search, ArrowRight, Globe } from 'lucide-react';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const UrlForm: React.FC<UrlFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      // Basic URL validation/formatting
      let formattedUrl = url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      onSubmit(formattedUrl);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Clone Website Information
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Enter any public URL. Our AI will analyze the domain and generate a comprehensive blueprint of its structure, pages, and key information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Globe className="h-6 w-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="e.g., stripe.com, github.com, your-competitor.com"
          className="block w-full pl-12 pr-32 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:ring-0 focus:border-brand-500 bg-white shadow-sm transition-all placeholder:text-slate-400"
          disabled={isLoading}
          required
        />
        <div className="absolute inset-y-2 right-2">
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="h-full flex items-center gap-2 px-6 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Search className="w-5 h-5 animate-pulse" />
                Scanning
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Analyze <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
        Note: This generates a semantic blueprint based on AI analysis, not a literal source-code clone.
      </div>
    </div>
  );
};
