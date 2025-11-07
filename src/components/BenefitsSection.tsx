import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Avatar, Card, CardContent, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

const benefits = [
  {
    icon: RemoveRedEyeIcon,
    title: "Attirer l'attention",
    description: "Captivez votre audience sur un stand avec une expérience visuelle unique et mémorable.",
  },
  {
    icon: AutoAwesomeIcon,
    title: "Montrer le savoir-faire",
    description: "Présentez votre artisanat de manière ludique et moderne qui valorise votre expertise.",
  },
  {
    icon: ShoppingCartIcon,
    title: "E-commerce immersif",
    description: "Préparez le futur de la vente en ligne avec des expériences d'achat interactives.",
  },
];

const BenefitsSection = () => {
  return (
    <Container
      component="section"
      maxWidth={false}
      sx={{
        py: { xs: 10, md: 14 },
        background: "radial-gradient(circle at top, rgba(214,161,93,0.1), transparent 65%)",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          textAlign="center"
          sx={{ fontSize: { xs: "2.25rem", md: "3.25rem" }, mb: 8 }}
        >
          Pourquoi cette démonstration ?
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Grid key={benefit.title} size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={10}
                  sx={{
                    height: "100%",
                    p: 3,
                    textAlign: "center",
                    transition: "transform 300ms ease, box-shadow 300ms ease",
                    '&:hover': {
                      transform: "translateY(-6px)",
                      boxShadow: "0 30px 80px rgba(214,161,93,0.25)",
                    },
                  }}
                >
                  <CardContent>
                    <Avatar
                      sx={{
                        width: 72,
                        height: 72,
                        mx: "auto",
                        mb: 3,
                        bgcolor: "rgba(214,161,93,0.12)",
                        color: "primary.main",
                      }}
                    >
                      <Icon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Container>
  );
};

export default BenefitsSection;
