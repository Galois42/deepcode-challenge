// Primary chart colors (all in blue shades)
export const CHART_COLORS = {
    primary: '#60A5FA',    // Main blue
    secondary: '#3B82F6',  // Slightly darker blue
    tertiary: '#2563EB',   // Even darker blue
    quaternary: '#1D4ED8', // Very dark blue
    highlight: '#93C5FD',  // Light blue
  } as const;
  
  // Status colors (still in blue theme)
  export const STATUS_COLORS = {
    resolved: '#3B82F6',    // Regular blue
    pending: '#93C5FD',     // Light blue
    critical: '#1E3A8A',    // Navy blue
    active: '#60A5FA',      // Bright blue
  } as const;
  
  // Color sequences for multi-series charts (blue progression)
  export const SEQUENTIAL_COLORS = [
    '#60A5FA',  // Primary blue
    '#3B82F6',  // Medium blue
    '#2563EB',  // Deep blue
    '#1D4ED8',  // Darker blue
    '#93C5FD',  // Light blue
  ];
  
  // Generate opacity variants
  export const getColorWithOpacity = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  // Predefined opacity variants
  export const COLOR_WITH_OPACITY = {
    hover: 0.8,
    active: 0.9,
    disabled: 0.5,
    background: 0.1,
    border: 0.3,
    glow: 0.2,
  } as const;
  
  // Generate gradient stops for charts
  export const createGradient = (color: string) => ({
    full: color,
    hover: getColorWithOpacity(color, COLOR_WITH_OPACITY.hover),
    background: getColorWithOpacity(color, COLOR_WITH_OPACITY.background),
    border: getColorWithOpacity(color, COLOR_WITH_OPACITY.border),
    glow: getColorWithOpacity(color, COLOR_WITH_OPACITY.glow),
  });
  
  // Theme-specific color sets (all blue variants)
  export const CHART_THEME = {
    primary: createGradient(CHART_COLORS.primary),
    secondary: createGradient(CHART_COLORS.secondary),
    tertiary: createGradient(CHART_COLORS.tertiary),
    quaternary: createGradient(CHART_COLORS.quaternary),
    highlight: createGradient(CHART_COLORS.highlight),
  };
  
  // Common chart configurations
  export const CHART_CONFIG = {
    grid: {
      stroke: getColorWithOpacity(CHART_COLORS.primary, 0.1),
      strokeDasharray: '3 3',
    },
    axis: {
      stroke: CHART_COLORS.primary,
      tick: {
        fill: CHART_COLORS.primary,
      },
    },
    tooltip: {
      background: '#1F2937',
      border: CHART_COLORS.primary,
      boxShadow: `0 0 10px ${getColorWithOpacity(CHART_COLORS.primary, 0.2)}`,
    },
  } as const;
  
  // Linear gradients for area charts
  export const AREA_GRADIENTS = {
    primary: {
      id: 'primaryAreaGradient',
      color: CHART_COLORS.primary,
      opacity: { start: 0.6, end: 0.1 },
    },
    secondary: {
      id: 'secondaryAreaGradient',
      color: CHART_COLORS.secondary,
      opacity: { start: 0.6, end: 0.1 },
    },
    tertiary: {
      id: 'tertiaryAreaGradient',
      color: CHART_COLORS.tertiary,
      opacity: { start: 0.6, end: 0.1 },
    },
  } as const;