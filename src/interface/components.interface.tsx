export interface TextHighlightProps {
  text: string;
  currentWordIndex: number;
  isRead?: boolean;
  onWordClick: (wordIndex: number) => void;
}

export interface VoiceNoteSimProps {
  text: string;
  isActive: boolean;
  allSentences?: string[];
  currentSentenceIdx?: number;
  currentWordIdx?: number;
  onWordProgress?: (sentenceIdx: number, wordIdx: number) => void;
  speechRate?: number;
}

export interface VoiceRecorderProps {
  onRecordingComplete: (duration: number) => void;
  expectedDuration?: number;
}

export interface WebcamSimProps {
  onFaceDetected?: (detected: boolean) => void;
  autoStart?: boolean;
}
