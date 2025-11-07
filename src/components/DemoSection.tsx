import { Box, Button, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";
import { useMemo, useState } from "react";
import ChocolateExperience from "./ChocolateExperience";

const QUALITY_CHIPS = ["Sans fichier", "Animation fluide", "360°"];

const sparkle = keyframes`
  0% { opacity: 0.25; transform: translate(-50%, -50%) scale(0.9); }
  50% { opacity: 0.45; transform: translate(-50%, -55%) scale(1.05); }
  100% { opacity: 0.25; transform: translate(-50%, -50%) scale(0.9); }
`;

const DemoSection = () => {
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const interactionLabel = useMemo(() => {
    if (isInteracting) {
      return "Rotation manuelle";
    }
    return isUnwrapped ? "Tablette révélée" : "Emballage premium";
  }, [isInteracting, isUnwrapped]);

  const handleUnwrap = () => {
    setIsUnwrapped((prev) => !prev);
  };

  const handleInteractionChange = (active: boolean) => {
    setIsInteracting(active);
  };

  return (
    <Box
      component="section"
      id="demo-section"
      sx={{
        py: { xs: 10, md: 14 },
        px: 2,
        background: "linear-gradient(180deg, rgba(33,15,7,0.95) 0%, rgba(15,8,4,0.95) 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} textAlign="center" mb={6}>
          <Typography variant="h2" sx={{ fontSize: { xs: "2.25rem", md: "3.25rem" } }}>
            Découvrez notre prototype interactif
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" fontStyle="italic">
            « J'ai une tablette de chocolat que tu n'as pas. »
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            {QUALITY_CHIPS.map((label) => (
              <Chip key={label} label={label} color="primary" variant="outlined" sx={{ bgcolor: "rgba(214,161,93,0.08)" }} />
            ))}
          </Stack>
        </Stack>

        <Container disableGutters maxWidth="md">
          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, position: "relative", overflow: "hidden" }} elevation={8}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: 4,
                pointerEvents: "none",
                background: `radial-gradient(circle at 20% 20%, ${alpha("#d6a15d", 0.18)}, transparent 70%), radial-gradient(circle at 80% 20%, ${alpha("#d6a15d", 0.12)}, transparent 70%)`,
              }}
            />

            <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
              <ChocolateExperience isUnwrapped={isUnwrapped} onInteractionChange={handleInteractionChange} />

              <Stack
                spacing={0.5}
                alignItems="center"
                justifyContent="center"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 4,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  color: "rgba(255,255,255,0.9)",
                  pointerEvents: "none",
                }}
              >
                <Typography variant="overline" fontWeight={600}>
                  {interactionLabel}
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    width: 140,
                    height: 2,
                    bgcolor: alpha("#ffe2a6", 0.35),
                    overflow: "hidden",
                    borderRadius: 999,
                    "&::after": {
                      content: "\"\"",
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
                      animation: `${sparkle} 4s ease-in-out infinite`,
                    },
                  }}
                />
              </Stack>
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={4} alignItems="center" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Cliquez-glissez pour faire pivoter la tablette. Le bouton permet d'ouvrir ou refermer l'emballage.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleUnwrap}
                sx={{ minWidth: 240 }}
              >
                {isUnwrapped ? "Réactiver l'emballage" : "Retirer l'emballage"}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Container>
    </Box>
  );
};

export default DemoSection;
