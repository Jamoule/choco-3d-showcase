import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, rgba(17,7,4,0.95), rgba(33,15,7,0.95))",
        color: "text.primary",
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} textAlign="center" alignItems="center">
          <Typography variant="h1" sx={{ fontSize: { xs: "4rem", md: "6rem" } }}>
            404
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Oups ! La page que vous cherchez a fondu comme du chocolat au soleil.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="/"
            startIcon={<ArrowBackIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            Retour à l'accueil
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default NotFound;
