export interface TranscriptionEntry {
  id: string;
  timestamp: Date;
  text: string;
  imageUrl?: string; // Optional: store a small thumbnail of what was transcribed
}

export enum AppStatus {
  IDLE = 'IDLE',
  WAITING_FOR_PERMISSION = 'WAITING_FOR_PERMISSION',
  MONITORING = 'MONITORING',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR'
}
