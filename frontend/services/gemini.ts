import { GoogleGenAI, Type } from '@google/genai';
import { SiteBlueprint } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const analyzeWebsite = async (url: string): Promise<SiteBlueprint> => {
  const prompt = `
    You are an elite web developer, security auditor, and technical analyst. The user wants a deep, comprehensive "clone" blueprint of a public website's architecture, simulating a full DevTools inspection.
    Analyze the following URL: ${url}
    
    Generate an extremely detailed technical blueprint. Since you cannot execute live code, use your extensive knowledge to infer the highly probable technical stack, JavaScript architecture, API endpoints, DevTools metrics, and DOM structure for a site of this specific domain, industry, and caliber.
    
    Go deep: What JS frameworks are likely used? What do the network requests look like? What security headers are present? What is the state management approach?
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          domain: { type: Type.STRING, description: 'Root domain' },
          organizationName: { type: Type.STRING, description: 'Company name' },
          summary: { type: Type.STRING, description: 'Detailed technical and business summary' },
          industry: { type: Type.STRING },
          primaryAudience: { type: Type.STRING },
          globalFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          techStack: {
            type: Type.OBJECT,
            properties: {
              frontend: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'e.g., React, Next.js, Tailwind' },
              backend: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'e.g., Node.js, Python, Go' },
              database: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'e.g., PostgreSQL, Redis' },
              infrastructure: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'e.g., AWS, Vercel, Cloudflare' },
              analytics: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'e.g., Google Analytics, PostHog' },
            },
            required: ['frontend', 'backend', 'database', 'infrastructure', 'analytics']
          },
          devToolsInsights: {
            type: Type.OBJECT,
            properties: {
              simulatedPerformanceScore: { type: Type.NUMBER, description: '0-100 Lighthouse style score' },
              simulatedAccessibilityScore: { type: Type.NUMBER, description: '0-100 score' },
              simulatedSeoScore: { type: Type.NUMBER, description: '0-100 score' },
              commonConsoleWarnings: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Likely console warnings/errors' },
              inferredNetworkRequests: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Key API calls (e.g., GET /api/v1/user)' },
              securityHeaders: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'e.g., CSP, X-Frame-Options' },
              localStorageUsage: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'What is likely stored in local/session storage' },
            },
            required: ['simulatedPerformanceScore', 'simulatedAccessibilityScore', 'simulatedSeoScore', 'commonConsoleWarnings', 'inferredNetworkRequests', 'securityHeaders', 'localStorageUsage']
          },
          sitemap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                path: { type: Type.STRING },
                title: { type: Type.STRING },
                purpose: { type: Type.STRING },
                mainTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                inferredFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                seoDescription: { type: Type.STRING, description: 'Inferred meta description' },
                inferredApis: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Specific API endpoints called on this page' },
                jsInteractions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Complex JS behaviors (e.g., infinite scroll, complex form validation)' },
                domStructure: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Key semantic HTML structure (e.g., <main>, <article>, <aside>)' },
              },
              required: ['path', 'title', 'purpose', 'mainTopics', 'inferredFeatures', 'seoDescription', 'inferredApis', 'jsInteractions', 'domStructure'],
            },
          },
        },
        required: ['domain', 'organizationName', 'summary', 'industry', 'primaryAudience', 'globalFeatures', 'techStack', 'devToolsInsights', 'sitemap'],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate blueprint.");
  }

  try {
    const blueprint: SiteBlueprint = JSON.parse(response.text);
    return blueprint;
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("Invalid response format from AI.");
  }
};
