import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppStatus, TranscriptionEntry } from './types.ts';
import { transcribeImage } from './services/geminiService.ts';
import TranscriptionLog from './components/TranscriptionLog.tsx';
import { MonitorPlay, Square, AlertCircle, Activity, Info, Crosshair } from 'lucide-react';

// Configuration
const CHECK_INTERVAL_MS = 2000; // How often to check for visual changes
const DIFF_THRESHOLD = 0.05; // 5% of pixels changed to trigger a new transcription
const DIFF_CANVAS_SIZE = 64; // Small size for fast pixel comparison

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  // Use a ref to track processing state to avoid stale closures in setInterval
  const isProcessingRef = useRef<boolean>(false);
  
  // Canvases for processing
  const captureCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const diffCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const prevImageDataRef = useRef<ImageData | null>(null);

  // Initialize diff canvas size
  useEffect(() => {
    diffCanvasRef.current.width = DIFF_CANVAS_SIZE;
    diffCanvasRef.current.height = DIFF_CANVAS_SIZE;
  }, []);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus(AppStatus.IDLE);
    prevImageDataRef.current = null;
    isProcessingRef.current = false;
  }, []);

  const handleStreamEnded = useCallback(() => {
    stopMonitoring();
    setErrorMsg("O compartilhamento de tela foi interrompido.");
  }, [stopMonitoring]);

  const processFrame = useCallback(async () => {
    // Skip if video is not ready or we are already processing a frame
    if (!videoRef.current || isProcessingRef.current) return;
    const video = videoRef.current;

    // Ensure video is playing and has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const diffCanvas = diffCanvasRef.current;
    const diffCtx = diffCanvas.getContext('2d', { willReadFrequently: true });
    if (!diffCtx) return;

    // 1. Draw current frame to small diff canvas
    diffCtx.drawImage(video, 0, 0, DIFF_CANVAS_SIZE, DIFF_CANVAS_SIZE);
    const currentImageData = diffCtx.getImageData(0, 0, DIFF_CANVAS_SIZE, DIFF_CANVAS_SIZE);

    // 2. Compare with previous frame
    let hasSignificantChange = false;
    if (prevImageDataRef.current) {
      let diffPixels = 0;
      const totalPixels = currentImageData.data.length / 4;
      
      for (let i = 0; i < currentImageData.data.length; i += 4) {
        // Simple absolute difference of RGB channels
        const rDiff = Math.abs(currentImageData.data[i] - prevImageDataRef.current.data[i]);
        const gDiff = Math.abs(currentImageData.data[i+1] - prevImageDataRef.current.data[i+1]);
        const bDiff = Math.abs(currentImageData.data[i+2] - prevImageDataRef.current.data[i+2]);
        
        // If pixel color changed significantly (threshold 30 out of 255)
        if (rDiff > 30 || gDiff > 30 || bDiff > 30) {
          diffPixels++;
        }
      }
      
      const diffRatio = diffPixels / totalPixels;
      if (diffRatio > DIFF_THRESHOLD) {
        hasSignificantChange = true;
      }
    } else {
      // First frame is always a "change"
      hasSignificantChange = true;
    }

    // If no significant change, just wait for the next interval
    if (!hasSignificantChange) {
      return;
    }

    // 3. If changed, lock processing, update baseline, and send to Gemini
    isProcessingRef.current = true;
    setStatus(AppStatus.PROCESSING);
    
    // Update previous image data ONLY when a change is detected and processed.
    // This helps detect gradual changes over time.
    prevImageDataRef.current = currentImageData;
    
    const captureCanvas = captureCanvasRef.current;
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const captureCtx = captureCanvas.getContext('2d');
    
    if (captureCtx) {
      captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
      // Use JPEG for smaller payload size
      const base64Image = captureCanvas.toDataURL('image/jpeg', 0.8);
      
      try {
        const text = await transcribeImage(base64Image);
        
        const newEntry: TranscriptionEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          text: text,
          // Store a smaller thumbnail for the UI to save memory
          imageUrl: captureCanvas.toDataURL('image/jpeg', 0.2) 
        };

        setTranscriptions(prev => [...prev, newEntry]);
      } catch (err) {
        console.error("Transcription failed:", err);
        // Don't stop monitoring on a single API failure, just log it
        const errorEntry: TranscriptionEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          text: "⚠️ Erro ao processar esta atualização. Tentando novamente na próxima mudança visual.",
        };
        setTranscriptions(prev => [...prev, errorEntry]);
      }
    }
    
    // Unlock processing and return to monitoring state (if not stopped manually)
    isProcessingRef.current = false;
    setStatus(prev => prev === AppStatus.PROCESSING ? AppStatus.MONITORING : prev);

  }, []); // Empty dependency array ensures setInterval always uses the correct reference

  const startMonitoring = async () => {
    setErrorMsg(null);
    setStatus(AppStatus.WAITING_FOR_PERMISSION);

    try {
      // Request screen sharing. 
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser", // Suggest tabs
        },
        audio: false
      });

      streamRef.current = stream;
      
      // Listen for user stopping the share via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', handleStreamEnded);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus(AppStatus.MONITORING);
      isProcessingRef.current = false;
      prevImageDataRef.current = null; // Reset baseline image
      
      // Clear any existing interval just in case
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      
      // Start the checking loop
      intervalRef.current = window.setInterval(processFrame, CHECK_INTERVAL_MS);

    } catch (err: any) {
      console.error("Error accessing display media:", err);
      setStatus(AppStatus.IDLE);
      if (err.name === 'NotAllowedError') {
        setErrorMsg("Permissão negada. Você precisa selecionar uma aba para compartilhar.");
      } else {
        setErrorMsg("Erro ao tentar capturar a tela: " + err.message);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <MonitorPlay size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Tab Transcriber AI</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Crosshair size={12} /> Mapeamento Espacial & Transcrição
            </p>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          {status === AppStatus.IDLE && <span className="w-2 h-2 rounded-full bg-slate-500"></span>}
          {status === AppStatus.WAITING_FOR_PERMISSION && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>}
          {status === AppStatus.MONITORING && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
          {status === AppStatus.PROCESSING && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>}
          <span className="text-sm font-medium text-slate-300">
            {status === AppStatus.IDLE && "Inativo"}
            {status === AppStatus.WAITING_FOR_PERMISSION && "Aguardando..."}
            {status === AppStatus.MONITORING && "Monitorando"}
            {status === AppStatus.PROCESSING && "Processando IA..."}
          </span>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar - Controls & Preview */}
        <aside className="w-full md:w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto">
          
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 text-sm text-blue-200 flex gap-3 items-start">
            <Info size={18} className="flex-shrink-0 mt-0.5 text-blue-400" />
            <p>
              A IA agora extrai as <strong>coordenadas (bounding boxes)</strong> de botões e elementos interativos para uso com DevTools.
              Selecione a aba que deseja monitorar.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {status === AppStatus.IDLE || status === AppStatus.WAITING_FOR_PERMISSION ? (
              <button
                onClick={startMonitoring}
                disabled={status === AppStatus.WAITING_FOR_PERMISSION}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <MonitorPlay size={20} />
                {status === AppStatus.WAITING_FOR_PERMISSION ? 'Aguardando Seleção...' : 'Iniciar Monitoramento'}
              </button>
            ) : (
              <button
                onClick={stopMonitoring}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
              >
                <Square size={20} />
                Parar Monitoramento
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-200 flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Live Preview */}
          <div className="mt-auto">
            <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Activity size={14} />
              Visualização ao Vivo
            </h3>
            <div className="bg-black rounded-lg overflow-hidden border border-slate-700 aspect-video relative shadow-inner">
              <video 
                ref={videoRef} 
                className="w-full h-full object-contain"
                muted 
                playsInline
              />
              {status === AppStatus.IDLE && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
                  Sem sinal
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              O conteúdo é analisado apenas quando ocorrem mudanças visuais significativas.
            </p>
          </div>
        </aside>

        {/* Right Area - Transcription Log */}
        <section className="flex-grow bg-slate-950 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto">
             <TranscriptionLog entries={transcriptions} />
          </div>
        </section>

      </main>
    </div>
  );
};

export default App;
