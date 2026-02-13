interface ThemeColors {
  success: string;
  danger: string;
  warning: string;
  info: string;
  light: string;
  dark: string;
  white: string;
}

interface Colors {
  theme: ThemeColors;
}

const themeColors: ThemeColors = {
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#ffffff'
};

const colors: Colors = { theme: themeColors };

export default colors;
