import React, { useState } from 'react';
import { SiteBlueprint, PageInfo } from '../types';
import { 
  Building2, Globe2, Users, Briefcase, Layers, FileText, List, Zap,
  ChevronDown, ChevronUp, ExternalLink, Terminal, Cpu, Database, 
  Activity, ShieldCheck, Code2, Network, Server, LayoutTemplate
} from 'lucide-react';

interface BlueprintDashboardProps {
  blueprint: SiteBlueprint;
}

export const BlueprintDashboard: React.FC<BlueprintDashboardProps> = ({ blueprint }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 animate-in fade-in duration-500 space-y-8">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard icon={<Building2 />} title="Organization" value={blueprint.organizationName} />
        <OverviewCard icon={<Globe2 />} title="Domain" value={blueprint.domain} />
        <OverviewCard icon={<Briefcase />} title="Industry" value={blueprint.industry} />
        <OverviewCard icon={<Users />} title="Target Audience" value={blueprint.primaryAudience} />
      </div>

      {/* Summary & Global Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" /> Executive Summary
          </h3>
          <p className="text-slate-600 leading-relaxed">{blueprint.summary}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" /> Global Features
          </h3>
          <ul className="space-y-2">
            {blueprint.globalFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Deep Technical Stack */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 text-slate-300">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-brand-400" /> Inferred Technology Stack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <TechColumn title="Frontend" icon={<LayoutTemplate className="w-4 h-4" />} items={blueprint.techStack.frontend} color="text-blue-400" />
          <TechColumn title="Backend" icon={<Server className="w-4 h-4" />} items={blueprint.techStack.backend} color="text-green-400" />
          <TechColumn title="Database" icon={<Database className="w-4 h-4" />} items={blueprint.techStack.database} color="text-purple-400" />
          <TechColumn title="Infrastructure" icon={<Network className="w-4 h-4" />} items={blueprint.techStack.infrastructure} color="text-orange-400" />
          <TechColumn title="Analytics" icon={<Activity className="w-4 h-4" />} items={blueprint.techStack.analytics} color="text-pink-400" />
        </div>
      </div>

      {/* DevTools Insights */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Terminal className="w-6 h-6 text-slate-700" /> DevTools & Performance Insights
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col gap-4">
            <ScoreBar label="Performance" score={blueprint.devToolsInsights.simulatedPerformanceScore} />
            <ScoreBar label="Accessibility" score={blueprint.devToolsInsights.simulatedAccessibilityScore} />
            <ScoreBar label="SEO" score={blueprint.devToolsInsights.simulatedSeoScore} />
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InsightList title="Network Requests (XHR/Fetch)" icon={<Network />} items={blueprint.devToolsInsights.inferredNetworkRequests} />
            <InsightList title="Security Headers" icon={<ShieldCheck />} items={blueprint.devToolsInsights.securityHeaders} />
            <InsightList title="Console Warnings" icon={<Terminal />} items={blueprint.devToolsInsights.commonConsoleWarnings} />
            <InsightList title="Local Storage Usage" icon={<Database />} items={blueprint.devToolsInsights.localStorageUsage} />
          </div>
        </div>
      </div>

      {/* Sitemap / Pages Breakdown */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <List className="w-6 h-6 text-brand-500" /> Deep Page Analysis ({blueprint.sitemap.length})
        </h3>
        <div className="space-y-4">
          {blueprint.sitemap.map((page, idx) => (
            <PageAccordion key={idx} page={page} domain={blueprint.domain} />
          ))}
        </div>
      </div>

    </div>
  );
};

const OverviewCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-start gap-4">
    <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="font-semibold text-slate-900 line-clamp-2">{value}</p>
    </div>
  </div>
);

const TechColumn = ({ title, icon, items, color }: { title: string, icon: React.ReactNode, items: string[], color: string }) => (
  <div>
    <h4 className={`font-semibold flex items-center gap-2 mb-3 ${color}`}>
      {icon} {title}
    </h4>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="text-sm bg-slate-800 px-3 py-1.5 rounded-md font-mono border border-slate-700">
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const ScoreBar = ({ label, score }: { label: string, score: number }) => {
  const getColor = (s: number) => {
    if (s >= 90) return 'bg-green-500';
    if (s >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  return (
    <div>
      <div className="flex justify-between text-sm font-medium mb-1">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-900">{score}/100</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${getColor(score)}`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
};

const InsightList = ({ title, icon, items }: { title: string, icon: React.ReactNode, items: string[] }) => (
  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
    <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-3 text-sm">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4 text-slate-500' })}
      {title}
    </h4>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="text-xs text-slate-600 font-mono flex items-start gap-2">
          <span className="text-brand-500 mt-0.5">›</span>
          <span className="break-all">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const PageAccordion = ({ page, domain }: { page: PageInfo, domain: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-200 hover:border-brand-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md font-mono text-sm shrink-0 border border-slate-200">
            {page.path}
          </div>
          <h4 className="font-bold text-slate-900 truncate">{page.title}</h4>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-4 border-t border-slate-100 bg-slate-50/50 space-y-6">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose</h5>
              <p className="text-sm text-slate-700">{page.purpose}</p>
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">SEO Description</h5>
              <p className="text-sm text-slate-700 italic">"{page.seoDescription}"</p>
            </div>
          </div>
          
          {/* Deep Dive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PageDetailList title="Main Topics" items={page.mainTopics} icon={<FileText className="w-3 h-3" />} />
            <PageDetailList title="JS Interactions" items={page.jsInteractions} icon={<Code2 className="w-3 h-3" />} />
            <PageDetailList title="API Endpoints" items={page.inferredApis} icon={<Network className="w-3 h-3" />} isCode />
            <PageDetailList title="DOM Structure" items={page.domStructure} icon={<LayoutTemplate className="w-3 h-3" />} isCode />
          </div>
          
          <div className="pt-4 border-t border-slate-200 flex justify-end">
             <a 
                href={`https://${domain}${page.path === '/' ? '' : page.path}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Visit Live Page <ExternalLink className="w-4 h-4" />
             </a>
          </div>
        </div>
      )}
    </div>
  );
};

const PageDetailList = ({ title, items, icon, isCode = false }: { title: string, items: string[], icon: React.ReactNode, isCode?: boolean }) => (
  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
    <h5 className="font-semibold text-slate-800 mb-2 text-xs uppercase tracking-wider flex items-center gap-1.5">
      {icon} {title}
    </h5>
    <ul className="space-y-1.5">
      {items.map((item, idx) => (
        <li key={idx} className={`text-xs flex items-start gap-1.5 ${isCode ? 'font-mono text-indigo-600' : 'text-slate-600'}`}>
          <span className="text-slate-300 mt-0.5">•</span>
          <span className="break-words">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);
