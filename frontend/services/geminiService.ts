import { GoogleGenAI } from '@google/genai';

// Initialize the SDK. It automatically picks up process.env.API_KEY in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

export const transcribeImage = async (base64Image: string): Promise<string> => {
  try {
    // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: `Analise esta captura de tela de uma interface web. O objetivo é fornecer dados estruturados para que outra IA de automação possa interagir com a página usando o Chrome DevTools.

Por favor, extraia as seguintes informações de forma clara e organizada:

1. **Conteúdo Textual Geral**: Transcreva o texto principal legível na tela para dar contexto sobre o estado atual da página.

2. **Mapeamento de Elementos Interativos**: Identifique TODOS os elementos clicáveis ou interativos (botões, links, campos de entrada de texto, checkboxes, menus dropdown, ícones de ação).
   Para CADA elemento interativo, você DEVE fornecer sua localização espacial usando o formato de bounding box [ymin, xmin, ymax, xmax], onde os valores variam de 0 a 1000 (sendo [0, 0] o canto superior esquerdo e [1000, 1000] o canto inferior direito da imagem).

Formate a lista de elementos interativos estritamente neste padrão:
- [Tipo do Elemento] "Texto ou Descrição Visual do Elemento" -> [ymin, xmin, ymax, xmax]

Exemplos:
- [Botão] "Fazer Login" -> [450, 300, 500, 700]
- [Input] "Digite sua pesquisa..." -> [100, 250, 140, 800]
- [Link] "Esqueci minha senha" -> [520, 300, 540, 450]
- [Ícone/Botão] "Lupa de pesquisa" -> [100, 810, 140, 850]

Seja o mais preciso possível nas coordenadas para garantir que cliques automatizados funcionem corretamente.`,
          },
        ],
      },
      config: {
        temperature: 0.1, // Temperatura baixa para maior precisão e consistência nas coordenadas
      }
    });

    return response.text || "Nenhum conteúdo detectado ou erro na transcrição.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Falha ao processar a imagem com a IA.");
  }
};
