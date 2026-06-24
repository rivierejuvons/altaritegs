export interface ServiceItem {
  id: string;
  title: string;
  duration: number; // in seconds
  elapsed: number; // in seconds
  owner: string;
  role: 'Audio' | 'Video' | 'Lighting' | 'Worship' | 'Producer';
  status: 'upcoming' | 'active' | 'complete' | 'delayed';
  slideId?: string;
  notes: string;
}

export interface ChecklistItem {
  id: string;
  role: 'Audio' | 'Video' | 'Lighting' | 'Worship' | 'Producer';
  task: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  role: string;
  channel: 'Audio' | 'Video' | 'Lighting' | 'Worship' | 'All-Team' | 'Announcements';
  text: string;
  timestamp: string;
}

export interface PatchNode {
  id: string;
  name: string;
  type: 'Microphone' | 'DI Box' | 'Mixer' | 'Speaker' | 'Camera' | 'Projector' | 'Switch' | 'Computer';
  sheet: 'Audio' | 'Video' | 'Lighting' | 'Network';
  x: number;
  y: number;
}

export interface PatchConnection {
  id: string;
  sourceId: string;
  targetId: string;
  channel?: string;
  cableColor?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'Audio Fundamentals' | 'Running the Mix' | 'Video Engineering' | 'Camera Work' | 'Lighting Design';
  videoUrl: string; // Simulated video assets
  duration: string;
  completed: boolean;
  acknowledgedAt?: string;
}

export interface SlidePreset {
  id: string;
  title: string;
  lyricLines: string[];
}
