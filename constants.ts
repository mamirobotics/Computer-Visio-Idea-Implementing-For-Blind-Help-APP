import { Language } from './types';

export const LANGUAGE_CONFIGS: Record<Language, { code: string; label: string; voiceLang: string }> = {
  [Language.ENGLISH]: { code: 'en', label: 'English', voiceLang: 'en-US' },
  [Language.URDU]: { code: 'ur', label: 'Urdu', voiceLang: 'ur-PK' },
  [Language.CHINESE]: { code: 'zh', label: '中文', voiceLang: 'zh-CN' },
};

export const AUTO_CAPTURE_INTERVAL_MS = 6000; // Capture every 6 seconds in auto mode
