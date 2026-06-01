import React, { useState, useCallback } from 'react';
import { Search, Stethoscope, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { searchJobOpportunities } from './services/geminiService.ts';
import { SearchResult } from './types.ts';
import { SourceList } from './components/SourceList.tsx';

export default function App() {
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const searchData = await searchJobOpportunities(location);
      setResult(searchData);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">
            <Stethoscope className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">BuscaMed ESF</h1>
            <p className="text-blue-100 text-xs font-medium">Radar de Editais e Concursos</p>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
        
        {/* Search Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
              Encontre sua próxima oportunidade na Saúde da Família
            </h2>
            <p className="text-slate-600">
              Nossa IA vasculha a internet em tempo real para encontrar editais abertos, extraindo prazos, salários e exigências para você.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Filtrar por Estado ou Cidade (Opcional)"
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="-ml-1 mr-2 h-5 w-5" />
                  Buscar Editais
                </>
              )}
            </button>
          </form>
        </section>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !result && (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && !isLoading && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Main Content (Markdown) */}
            <div className="flex-grow w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm">
                  Resultados Encontrados
                </span>
              </h2>
              
              <div className="markdown-body prose prose-slate max-w-none">
                <ReactMarkdown>
                  {result.text}
                </ReactMarkdown>
              </div>
            </div>

            {/* Sidebar (Sources) */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
              <SourceList sources={result.sources} />
              
              <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Aviso Importante</h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  As informações apresentadas são extraídas automaticamente de resultados de busca na internet pela IA. 
                  Sempre verifique os dados diretamente nos links das fontes oficiais (editais completos) antes de realizar inscrições ou pagamentos.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>
      
      <footer className="bg-slate-800 text-slate-400 py-6 text-center text-sm mt-auto">
        <p>BuscaMed ESF &copy; {new Date().getFullYear()} - Desenvolvido com Google Gemini API</p>
      </footer>
    </div>
  );
}
