// Remotion video constants

export const VIDEO_CONFIG = {
  fps: 30,
  width: 1080,
  height: 1920, // 9:16 vertical for mobile-first
  durationInFrames: {
    alertZone: 15 * 30, // 15 seconds
    lostChild: 20 * 30, // 20 seconds
    medicalEmergency: 20 * 30, // 20 seconds
  },
};

// Colors matching SecureID brand
export const COLORS = {
  primary: '#f97316', // Orange-500
  primaryDark: '#ea580c', // Orange-600
  secondary: '#f59e0b', // Amber-500
  success: '#22c55e', // Green-500
  danger: '#ef4444', // Red-500
  info: '#3b82f6', // Blue-500
  dark: '#1c1917', // Stone-900
  light: '#FAFAF9', // Stone-50
  white: '#ffffff',
  gray: {
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
};

// Animation timings (in frames at 30fps)
export const TIMING = {
  fadeIn: 15, // 0.5s
  fadeOut: 15,
  sceneTransition: 30, // 1s
  holdDuration: 60, // 2s
  notificationSlide: 10,
  pulseInterval: 30,
};

// Typography
export const FONTS = {
  primary: 'Outfit, system-ui, sans-serif',
  display: 'Playfair Display, serif',
};

// Scene breakpoints (in frames)
export const SCENES = {
  alertZone: {
    mapSetup: { start: 0, end: 90 },
    childLeaves: { start: 90, end: 180 },
    notification: { start: 180, end: 300 },
    parentView: { start: 300, end: 450 },
  },
  lostChild: {
    childAlone: { start: 0, end: 120 },
    rescuerApproach: { start: 120, end: 210 },
    qrScan: { start: 210, end: 330 },
    infoDisplay: { start: 330, end: 480 },
    parentCall: { start: 480, end: 600 },
  },
  medicalEmergency: {
    classroom: { start: 0, end: 120 },
    childUnwell: { start: 120, end: 210 },
    teacherScan: { start: 210, end: 330 },
    medicalInfo: { start: 330, end: 480 },
    nurseCall: { start: 480, end: 600 },
  },
};
