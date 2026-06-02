import React from 'react';
import { Copy, ScanLine } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 p-2 rounded-lg">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">WebClone AI</h1>
            <p className="text-xs text-slate-500 font-medium">Semantic Site Blueprinting</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><Copy className="w-4 h-4" /> Extract Structure</span>
        </div>
      </div>
    </header>
  );
};
