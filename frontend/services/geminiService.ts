import { GoogleGenAI } from '@google/genai';
import { SearchResult, GroundingChunk } from '../types.ts';

// Initialize the SDK. It automatically picks up process.env.API_KEY in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const searchJobOpportunities = async (location: string): Promise<SearchResult> => {
  const prompt = `
Você é um assistente especializado em encontrar oportunidades de trabalho para médicos no Brasil.
Sua tarefa é usar a busca do Google para encontrar editais, concursos públicos e processos seletivos **atualmente abertos ou muito recentes** para o cargo de "Médico da Estratégia de Saúde da Família" (ESF) ou "Médico de Família e Comunidade".

${location.trim() !== '' ? `Foque especificamente na região/estado/cidade de: ${location}.` : 'Busque oportunidades em todo o Brasil, priorizando as mais recentes.'}

Para cada oportunidade encontrada, você DEVE extrair e apresentar as seguintes informações de forma estruturada:
- **Instituição/Cidade/Estado**
- **Período de inscrição** (datas exatas de início e fim, se disponíveis)
- **Valor da taxa de inscrição** (ou se há isenção)
- **Forma de seleção** (ex: Prova objetiva, análise de currículo/títulos, entrevista)
- **Salário/Remuneração**
- **Carga horária**

Apresente os resultados formatados em Markdown. 
Use '###' para o nome de cada oportunidade (Instituição/Local).
Use bullet points ('-') para listar os detalhes exigidos acima.
Seja conciso e direto. Se não encontrar informações exatas para algum dos pontos no edital/resumo, escreva "Não informado no resumo".
Não invente dados. Baseie-se estritamente nos resultados da busca.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // Enable Google Search grounding
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType and responseSchema are NOT allowed when using googleSearch
      },
    });

    const text = response.text || "Nenhuma informação encontrada.";
    
    // Extract grounding chunks (URLs)
    const groundingChunks: GroundingChunk[] = 
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      text,
      sources: groundingChunks,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Falha ao buscar oportunidades. Tente novamente mais tarde.");
  }
};
