module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: { 
    extend: { 
      colors: { 
        saffron: {
          DEFAULT: "#FF6B35",
          50: "#FFF5F0",
          100: "#FFE8DD",
          200: "#FFD0C0",
          300: "#FFB88C",
          400: "#FF9A6B",
          500: "#FF6B35",
          600: "#FF4D1A",
          700: "#E63A0F",
          800: "#CC2E0A",
          900: "#B32408"
        },
        indigo: {
          DEFAULT: "#4A5568",
          50: "#F7FAFC",
          100: "#EDF2F7",
          200: "#E2E8F0",
          300: "#CBD5E0",
          400: "#A0AEC0",
          500: "#718096",
          600: "#4A5568",
          700: "#2D3748",
          800: "#1A202C",
          900: "#171923"
        },
        'header-red': {
          DEFAULT: '#8B2635',
          light: '#A03040',
          dark: '#6B1E2A'
        },
        gold: {
          DEFAULT: "#DAA520",
          50: "#FAF5E6",
          100: "#F5EBCC",
          200: "#EBD799",
          300: "#E0C366",
          400: "#D6AF33",
          500: "#DAA520",
          600: "#C3911D",
          700: "#AC7D1A",
          800: "#956917",
          900: "#7E5514"
        },
        emerald: {
          DEFAULT: "#3D9970",
          50: "#EEF7F3",
          100: "#DBEDE4",
          200: "#B7DACC",
          300: "#93C7B5",
          400: "#6FB49D",
          500: "#3D9970",
          600: "#378A65",
          700: "#317C5A",
          800: "#2B6E4F",
          900: "#256144"
        },
        maroon: {
          DEFAULT: "#800000",
          50: "#F2E6E6",
          100: "#E6CCCC",
          200: "#CC9999",
          300: "#B36666",
          400: "#993333",
          500: "#800000",
          600: "#730000",
          700: "#660000",
          800: "#4D0000",
          900: "#330000"
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(255, 107, 53, 0.3)',
      }
    } 
  },
  plugins: []
};
