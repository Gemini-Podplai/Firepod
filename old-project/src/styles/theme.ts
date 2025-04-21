export const theme = {
  colors: {
    // Light mode
    light: {
      background: '#ffffff',
      foreground: '#1f1f1f',
      primary: '#1a73e8',
      primaryHover: '#1765cc',
      secondary: '#f1f3f4',
      secondaryHover: '#e8eaed',
      border: '#dadce0',
      inputBg: '#ffffff',
      userBubble: '#e7f5ff',
      aiBubble: '#f1f3f4',
      muted: '#5f6368',
    },
    // Dark mode (Google AI Studio inspired)
    dark: {
      background: '#202124',
      foreground: '#e8eaed',
      primary: '#8ab4f8',
      primaryHover: '#aecbfa',
      secondary: '#3c4043',
      secondaryHover: '#4e5256',
      border: '#5f6368',
      inputBg: '#303134',
      userBubble: '#394457',
      aiBubble: '#303134',
      muted: '#9aa0a6',
    }
  },
  shadows: {
    light: {
      small: '0 1px 2px rgba(60, 64, 67, 0.1)',
      medium: '0 2px 6px rgba(60, 64, 67, 0.15)',
    },
    dark: {
      small: '0 1px 2px rgba(0, 0, 0, 0.25)',
      medium: '0 2px 6px rgba(0, 0, 0, 0.3)',
    }
  },
  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '2.5rem',
  }
};
