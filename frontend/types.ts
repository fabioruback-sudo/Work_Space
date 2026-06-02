export interface TechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  infrastructure: string[];
  analytics: string[];
}

export interface DevToolsInsights {
  simulatedPerformanceScore: number;
  simulatedAccessibilityScore: number;
  simulatedSeoScore: number;
  commonConsoleWarnings: string[];
  inferredNetworkRequests: string[];
  securityHeaders: string[];
  localStorageUsage: string[];
}

export interface PageInfo {
  path: string;
  title: string;
  purpose: string;
  mainTopics: string[];
  inferredFeatures: string[];
  seoDescription: string;
  inferredApis: string[];
  jsInteractions: string[];
  domStructure: string[];
}

export interface SiteBlueprint {
  domain: string;
  organizationName: string;
  summary: string;
  industry: string;
  primaryAudience: string;
  globalFeatures: string[];
  techStack: TechStack;
  devToolsInsights: DevToolsInsights;
  sitemap: PageInfo[];
}
