import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#1b0f07",
      paper: "rgba(33, 20, 11, 0.9)",
    },
    primary: {
      main: "#d6a15d",
      contrastText: "#210f07",
    },
    secondary: {
      main: "#9c6f3b",
    },
    text: {
      primary: "#f6e7d7",
      secondary: "#d4c0aa",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(20px)",
          backgroundImage: "linear-gradient(135deg, rgba(214, 161, 93, 0.08), rgba(29, 17, 10, 0.6))",
          border: "1px solid rgba(214, 161, 93, 0.2)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
  },
});

export default theme;
