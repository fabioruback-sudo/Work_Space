import React, { useEffect, useRef } from 'react';
import { TranscriptionEntry } from '../types.ts';
import { Clock, Image as ImageIcon } from 'lucide-react';

interface TranscriptionLogProps {
  entries: TranscriptionEntry[];
}

const TranscriptionLog: React.FC<TranscriptionLogProps> = ({ entries }) => {
  const endOfLogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
        <Clock size={48} className="opacity-20" />
        <p>Nenhuma transcrição ainda. Inicie o monitoramento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-700 animate-fade-in">
          <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Clock size={12} />
              {entry.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {entry.imageUrl && (
              <div className="flex-shrink-0 w-full md:w-48 h-32 bg-slate-900 rounded overflow-hidden border border-slate-700 relative group">
                <img src={entry.imageUrl} alt="Captura" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 pointer-events-none">
                  <ImageIcon size={24} className="text-white" />
                </div>
              </div>
            )}
            <div className="flex-grow text-slate-200 whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {entry.text}
            </div>
          </div>
        </div>
      ))}
      <div ref={endOfLogRef} />
    </div>
  );
};

export default TranscriptionLog;
