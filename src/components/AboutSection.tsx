import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";

const AboutSection = () => {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        px: 2,
        background: "linear-gradient(135deg, rgba(214,161,93,0.15) 0%, rgba(20,10,6,0.95) 100%)",
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4} textAlign="center" alignItems="center">
          <Box>
            <Typography variant="h2" sx={{ fontSize: { xs: "3rem", md: "4rem" }, color: "primary.main" }}>
              Kebweb
            </Typography>
            <Box sx={{ width: 120, height: 4, bgcolor: "primary.main", mx: "auto", mt: 2 }} />
          </Box>

          <Stack spacing={2} sx={{ color: "text.secondary", fontSize: "1.1rem" }}>
            <Typography>
              Nous créons des expériences numériques sur mesure pour les marques qui veulent marquer les esprits.
            </Typography>
            <Typography>
              Sites web, outils de gestion, prototypes 3D — notre seule limite, c'est votre imagination.
            </Typography>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<MailOutlineIcon />}
            onClick={() => (window.location.href = "mailto:contact@kebweb.com")}
            sx={{
              px: 6,
              py: 2.5,
              fontSize: "1.1rem",
              boxShadow: "0 20px 60px rgba(214,161,93,0.35)",
              transition: "transform 300ms ease, box-shadow 300ms ease",
              '&:hover': {
                transform: "translateY(-3px)",
                boxShadow: "0 30px 80px rgba(214,161,93,0.5)",
              },
            }}
          >
            Parlons de votre projet
          </Button>

          <Divider flexItem sx={{ width: "100%", borderColor: "rgba(214,161,93,0.3)", mt: 6 }} />
          <Typography variant="body2" color="text.secondary">
            © 2025 Kebweb. Tous droits réservés.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default AboutSection;
