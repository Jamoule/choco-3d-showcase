import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Button, Container, Typography } from "@mui/material";

interface HeroSectionProps {
  onScrollToDemo: () => void;
}

const HeroSection = ({ onScrollToDemo }: HeroSectionProps) => {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "radial-gradient(circle at 20% 20%, rgba(214,161,93,0.25), transparent 55%), linear-gradient(135deg, #210f07 0%, #3b2313 50%, #210f07 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.15,
          backgroundImage:
            "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", textAlign: "center", zIndex: 1 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2.75rem", md: "4.5rem" }, mb: 3, color: "text.primary" }}>
          Faites goûter votre chocolat en 3D.
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 5,
            color: "text.secondary",
            maxWidth: { md: "720px" },
            mx: "auto",
            fontWeight: 400,
          }}
        >
          Tablettes interactives, emballages animés, et expériences e-commerce immersives.
        </Typography>

        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={onScrollToDemo}
          sx={{
            px: 6,
            py: 2.5,
            fontSize: "1.1rem",
            boxShadow: "0 20px 60px rgba(214,161,93,0.35)",
            transition: "transform 300ms ease, box-shadow 300ms ease",
            '&:hover': {
              transform: "translateY(-4px)",
              boxShadow: "0 30px 80px rgba(214,161,93,0.45)",
            },
          }}
        >
          Voir la tablette en 3D
        </Button>

        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 24, md: 40 },
            left: "50%",
            transform: "translate(-50%, 0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "bounce 2.5s infinite",
            color: "text.secondary",
          }}
        >
          <KeyboardArrowDownIcon fontSize="large" />
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
