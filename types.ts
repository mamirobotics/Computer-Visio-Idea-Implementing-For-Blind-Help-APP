export enum Language {
  ENGLISH = 'English',
  URDU = 'Urdu',
  CHINESE = 'Chinese'
}

export interface AppState {
  isPlaying: boolean;
  isProcessing: boolean;
  lastDescription: string | null;
  autoMode: boolean;
  error: string | null;
}

export interface CameraHandle {
  captureFrame: () => string | null;
}
