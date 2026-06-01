import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import { GroundingChunk } from '../types.ts';

interface SourceListProps {
  sources: GroundingChunk[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  // Filter out chunks that don't have web info
  const webSources = sources.filter(chunk => chunk.web && chunk.web.uri);

  if (webSources.length === 0) {
    return null;
  }

  // Deduplicate sources by URI to avoid clutter
  const uniqueSources = Array.from(new Map(webSources.map(item => [item.web!.uri, item])).values());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-6">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800">Fontes Consultadas</h3>
      </div>
      <ul className="space-y-3">
        {uniqueSources.map((source, index) => (
          <li key={index} className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
            <a
              href={source.web!.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-words line-clamp-2"
              title={source.web!.title}
            >
              {source.web!.title || source.web!.uri}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
