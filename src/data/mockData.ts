import { ServiceItem, ChecklistItem, ChatMessage, PatchNode, PatchConnection, TrainingModule, SlidePreset } from '../types';

export const INITIAL_SERVICE_ITEMS: ServiceItem[] = [
  {
    id: 'item-1',
    title: 'Pre-Service Countdown & Slides',
    duration: 300, // 5 min
    elapsed: 300,
    owner: 'Sarah (Producer)',
    role: 'Producer',
    status: 'complete',
    slideId: 'slide-1',
    notes: 'Roll slides, cue foyer screen music, verify audio levels on stream. Ensure PCO schedule is loaded.',
  },
  {
    id: 'item-2',
    title: 'Opening Worship: "Great Are You Lord"',
    duration: 360, // 6 min
    elapsed: 360,
    owner: 'David (Worship Lead)',
    role: 'Worship',
    status: 'complete',
    slideId: 'slide-2',
    notes: 'Guitars up in front fill monitors. Strobe effect disabled for this song. Keep lighting warm/golden.',
  },
  {
    id: 'item-3',
    title: 'Worship: "Gratitude" & Opening Prayer',
    duration: 420, // 7 min
    elapsed: 415,
    owner: 'David (Worship Lead)',
    role: 'Worship',
    status: 'complete',
    slideId: 'slide-3',
    notes: 'Transition seamlessly from "Great Are You Lord" key. Dim house lights to 10%. Bassist switch to upright.',
  },
  {
    id: 'item-4',
    title: 'Welcome & Weekly Announcements',
    duration: 240, // 4 min
    elapsed: 260, // Over-run slightly
    owner: 'Pastor Marcus',
    role: 'Producer',
    status: 'complete',
    slideId: 'slide-4',
    notes: 'Mute acoustic guitar. Live video feed on sanctuary screen. Queue announcement video scroll.',
  },
  {
    id: 'item-5',
    title: 'Sermon: "Walking by Faith" (Galatians 5)',
    duration: 1800, // 30 min
    elapsed: 421, // Running live right now!
    owner: 'Pastor Marcus',
    role: 'Producer',
    status: 'active',
    slideId: 'slide-5',
    notes: 'Keep lighting focused strictly on center stage. Monitor room SPL closely (target max 88 dB). Show sermon scriptures in ProPresenter.',
  },
  {
    id: 'item-6',
    title: 'Altar Call / Reflection Song: "Goodness of God"',
    duration: 300, // 5 min
    elapsed: 0,
    owner: 'David (Worship Lead)',
    role: 'Worship',
    status: 'upcoming',
    slideId: 'slide-6',
    notes: 'Be ready for emotional build-up. Pad keyboard background. Fade in front spot lights gradually.',
  },
  {
    id: 'item-7',
    title: 'Closing Comments, Blessing & Dismissal',
    duration: 180, // 3 min
    elapsed: 0,
    owner: 'Pastor Marcus',
    role: 'Producer',
    status: 'upcoming',
    slideId: 'slide-7',
    notes: 'Worship keys continue background pad. Fade up house lights. Scroll exit slide. Re-engage foyer lobby feeds.',
  }
];

export const INITIAL_CHECKLISTS: ChecklistItem[] = [
  // Audio Team
  { id: 'chk-a1', role: 'Audio', task: 'Power on main amp rack and Line Array controllers', completed: true, completedBy: 'James (Audio)', completedAt: '08:05 AM' },
  { id: 'chk-a2', role: 'Audio', task: 'Check acoustic guitar & lead vocal wireless frequencies (Interference check)', completed: true, completedBy: 'James (Audio)', completedAt: '08:12 AM' },
  { id: 'chk-a3', role: 'Audio', task: 'Verify personal monitor IEM mixes with stage band players', completed: true, completedBy: 'James (Audio)', completedAt: '08:45 AM' },
  { id: 'chk-a4', role: 'Audio', task: 'Configure foyer lobby speaker matrix feed', completed: false },
  { id: 'chk-a5', role: 'Audio', task: 'Launch broadcast mix bus recording', completed: false },

  // Video Team
  { id: 'chk-v1', role: 'Video', task: 'Turn on lobby displays and verify signal route', completed: true, completedBy: 'Maria (Video)', completedAt: '08:10 AM' },
  { id: 'chk-v2', role: 'Video', task: 'Calibrate Blackmagic PTZ cameras white balance', completed: true, completedBy: 'Maria (Video)', completedAt: '08:22 AM' },
  { id: 'chk-v3', role: 'Video', task: 'Boot FreeShow presentation computer and map network slides source', completed: true, completedBy: 'Maria (Video)', completedAt: '08:31 AM' },
  { id: 'chk-v4', role: 'Video', task: 'Establish sync connection to PCO plan', completed: true, completedBy: 'Maria (Video)', completedAt: '08:35 AM' },
  { id: 'chk-v5', role: 'Video', task: 'Initiate OBS stream preview check (Bitrate check)', completed: false },

  // Lighting Team
  { id: 'chk-l1', role: 'Lighting', task: 'Verify all stage moving heads homing and reset', completed: true, completedBy: 'Toni (Lighting)', completedAt: '08:15 AM' },
  { id: 'chk-l2', role: 'Lighting', task: 'Dimmer check on back light warm wash', completed: true, completedBy: 'Toni (Lighting)', completedAt: '08:18 AM' },
  { id: 'chk-l3', role: 'Lighting', task: 'Set Stage Left / Stage Right focal spot positions', completed: false },
  { id: 'chk-l4', role: 'Lighting', task: 'Coordinate look for sermon intro with Producer', completed: false },

  // Worship Team
  { id: 'chk-w1', role: 'Worship', task: 'Vocal warmups and vocal mic gains verified', completed: true, completedBy: 'David (Worship Lead)', completedAt: '08:20 AM' },
  { id: 'chk-w2', role: 'Worship', task: 'Keyboard midi interface mapping reload', completed: true, completedBy: 'Julia (Worship)', completedAt: '08:25 AM' },
  { id: 'chk-w3', role: 'Worship', task: 'Verify chord sheets match active PCO arrangement keys', completed: true, completedBy: 'David (Worship Lead)', completedAt: '08:28 AM' },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'msg-1', author: 'Sarah (Producer)', role: 'Producer', channel: 'All-Team', text: 'Good morning crew! Let\'s pull off an amazing service today. Announcements video run will happen right after Worship 2 concludes.', timestamp: '08:10 AM' },
  { id: 'msg-2', author: 'James (Audio)', role: 'Audio', channel: 'Audio', text: 'Acoustic Guitar wireless channel changed from 5 to 7. There was localized rf interference.', timestamp: '08:22 AM' },
  { id: 'msg-3', author: 'Maria (Video)', role: 'Video', channel: 'Video', text: 'FreeShow auto-discovery detected the presentation workstation perfectly. Slide sync is active!', timestamp: '08:36 AM' },
  { id: 'msg-4', author: 'Sarah (Producer)', role: 'Producer', channel: 'All-Team', text: 'Pastor Marcus wants to focus lighting extra sharp on center stage for the Galatians reading.', timestamp: '08:44 AM' },
  { id: 'msg-5', author: 'Toni (Lighting)', role: 'Lighting', channel: 'Lighting', text: 'Roger that. Adjusting preset lighting scene to tighten spotlight beam size.', timestamp: '08:46 AM' },
];

export const INITIAL_PATCH_NODES: PatchNode[] = [
  // Audio sheet
  { id: 'pt-aud1', name: 'Lead Vocals Mic', type: 'Microphone', sheet: 'Audio', x: 100, y: 150 },
  { id: 'pt-aud2', name: 'Acoust Guitar DI', type: 'DI Box', sheet: 'Audio', x: 100, y: 350 },
  { id: 'pt-aud3', name: 'Behringer X32 Console', type: 'Mixer', sheet: 'Audio', x: 450, y: 250 },
  { id: 'pt-aud4', name: 'Stage Right Array', type: 'Speaker', sheet: 'Audio', x: 800, y: 150 },
  { id: 'pt-aud5', name: 'Broadcast Recorder', type: 'Computer', sheet: 'Audio', x: 800, y: 350 },

  // Video sheet
  { id: 'pt-vid1', name: 'PTZ Camera 1', type: 'Camera', sheet: 'Video', x: 100, y: 150 },
  { id: 'pt-vid2', name: 'FreeShow Presentation PC', type: 'Computer', sheet: 'Video', x: 100, y: 350 },
  { id: 'pt-vid3', name: 'Atem Mini Switcher', type: 'Switch', sheet: 'Video', x: 450, y: 250 },
  { id: 'pt-vid4', name: 'Sanctuary Projector', type: 'Projector', sheet: 'Video', x: 800, y: 150 },
  { id: 'pt-vid5', name: 'Lobby Display Hub', type: 'Projector', sheet: 'Video', x: 800, y: 350 },
  
  // Lighting sheet
  { id: 'pt-lt1', name: 'Chauvet DMX Controller', type: 'Switch', sheet: 'Lighting', x: 100, y: 250 },
  { id: 'pt-lt2', name: 'Front Spot Dimmer Pack', type: 'Mixer', sheet: 'Lighting', x: 450, y: 150 },
  { id: 'pt-lt3', name: 'Back Wash fixtures', type: 'Speaker', sheet: 'Lighting', x: 450, y: 350 },
  { id: 'pt-lt4', name: 'Lekos Fixture Center Stage', type: 'Projector', sheet: 'Lighting', x: 800, y: 250 },

  // Network sheet
  { id: 'pt-net1', name: 'ISP Modem Router', type: 'Switch', sheet: 'Network', x: 100, y: 250 },
  { id: 'pt-net2', name: 'Production PoE Switch', type: 'Switch', sheet: 'Network', x: 450, y: 250 },
  { id: 'pt-net3', name: 'Altarite Workstation', type: 'Computer', sheet: 'Network', x: 800, y: 150 },
  { id: 'pt-net4', name: 'Wifi Access Point', type: 'Switch', sheet: 'Network', x: 800, y: 350 }
];

export const INITIAL_PATCH_CONNECTIONS: PatchConnection[] = [
  // Audio
  { id: 'conn-a1', sourceId: 'pt-aud1', targetId: 'pt-aud3', channel: 'Ch 01', cableColor: '#10b981' },
  { id: 'conn-a2', sourceId: 'pt-aud2', targetId: 'pt-aud3', channel: 'Ch 04', cableColor: '#f59e0b' },
  { id: 'conn-a3', sourceId: 'pt-aud3', targetId: 'pt-aud4', channel: 'Out 01-02', cableColor: '#3b82f6' },
  { id: 'conn-a4', sourceId: 'pt-aud3', targetId: 'pt-aud5', channel: 'Aux 05-06', cableColor: '#ec4899' },

  // Video
  { id: 'conn-v1', sourceId: 'pt-vid1', targetId: 'pt-vid3', channel: 'HDMI 1', cableColor: '#10b981' },
  { id: 'conn-v2', sourceId: 'pt-vid2', targetId: 'pt-vid3', channel: 'HDMI 2', cableColor: '#3b82f6' },
  { id: 'conn-vid3', sourceId: 'pt-vid3', targetId: 'pt-vid4', channel: 'SDI Out', cableColor: '#f59e0b' },
  { id: 'conn-vid4', sourceId: 'pt-vid3', targetId: 'pt-vid5', channel: 'HDMI Mirror', cableColor: '#ec4899' },

  // Lighting
  { id: 'conn-l1', sourceId: 'pt-lt1', targetId: 'pt-lt2', channel: 'DMX Universe 1', cableColor: '#10b981' },
  { id: 'conn-l2', sourceId: 'pt-lt1', targetId: 'pt-lt3', channel: 'DMX Universe 2', cableColor: '#3b82f6' },
  { id: 'conn-l3', sourceId: 'pt-lt2', targetId: 'pt-lt4', channel: 'Spot Out 3', cableColor: '#ec4899' },

  // Network
  { id: 'conn-n1', sourceId: 'pt-net1', targetId: 'pt-net2', channel: 'Gigabit Port 1', cableColor: '#3b82f6' },
  { id: 'conn-n2', sourceId: 'pt-net2', targetId: 'pt-net3', channel: 'Port 5 (Admin)', cableColor: '#10b981' },
  { id: 'conn-n3', sourceId: 'pt-net2', targetId: 'pt-net4', channel: 'Port 8 (PoE)', cableColor: '#f59e0b' }
];

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'tr-1',
    title: 'Sanctuary Audio Basics & Signal Chain',
    description: 'Understand how microphone capsule signals arrive at the X32, how DCA groups scale master levels, and simple feedback prevention techniques.',
    category: 'Audio Fundamentals',
    videoUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=640&auto=format&fit=crop',
    duration: '12:45',
    completed: true,
    acknowledgedAt: '2026-06-15 09:30 AM'
  },
  {
    id: 'tr-2',
    title: 'Advanced Personal IEM Monitor Mixes',
    description: 'Best practices for mapping iPad IEM feeds for band members. Learn split-fader techniques and how to communicate with guitarists.',
    category: 'Running the Mix',
    videoUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=640&auto=format&fit=crop',
    duration: '08:12',
    completed: false
  },
  {
    id: 'tr-3',
    title: 'White Balance Preset Sync on PTZs',
    description: 'Learn how to set up color profiles inside PTZ cameras to handle shifting backlight intensities between morning sun and artificial wash colors.',
    category: 'Video Engineering',
    videoUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=640&auto=format&fit=crop',
    duration: '10:30',
    completed: false
  },
  {
    id: 'tr-4',
    title: 'Framing Rules for Live Stream Feeds',
    description: 'Essential panning speeds, safe headrooms, and rules for active camera pans during keyboard pads or transitions.',
    category: 'Camera Work',
    videoUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=640&auto=format&fit=crop',
    duration: '09:15',
    completed: false
  }
];

export const SLIDE_PRESETS: SlidePreset[] = [
  {
    id: 'slide-1',
    title: 'Pre-Service Slide',
    lyricLines: [
      'Welcome to Altarite!',
      'Service begins in 5 minutes',
      'Please scan the phone QR code to access your checklist'
    ]
  },
  {
    id: 'slide-2',
    title: 'Great Are You Lord - Chorus',
    lyricLines: [
      'It\'s Your breath in our lungs',
      'So we pour out our praise',
      'We pour out our praise'
    ]
  },
  {
    id: 'slide-3',
    title: 'Gratitude - Bridge',
    lyricLines: [
      'So come on, my soul, oh don\'t you get shy on me',
      'Lift up your song \'cause you\'ve got a lion inside of those lungs',
      'Get up and praise the Lord!'
    ]
  },
  {
    id: 'slide-4',
    title: 'Welcome Screen',
    lyricLines: [
      'We are so glad you are here with us!',
      'Altarite Community Church',
      'June 22, 2026'
    ]
  },
  {
    id: 'slide-5',
    title: 'Sermon: Walking by Faith',
    lyricLines: [
      '"But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness..."',
      '— Galatians 5:22',
      'Live with Grace, Stand in Truth.'
    ]
  },
  {
    id: 'slide-6',
    title: 'Goodness of God - Chorus',
    lyricLines: [
      'All my life You have been faithful',
      'All my life You have been so, so good',
      'With every breath that I am able'
    ]
  },
  {
    id: 'slide-7',
    title: 'Blessing & Dismissal Screen',
    lyricLines: [
      'Go in peace to love and serve the Lord.',
      'Thank you for joining our live production team today!',
      'Have a blessed week ahead.'
    ]
  }
];
