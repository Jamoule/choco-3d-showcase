import { Box, Button, Chip, CircularProgress, Container, Fade, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

type ModelViewerElement = HTMLElement & {
  animationName?: string;
  currentTime?: number;
  play?: () => void;
  pause?: () => void;
};

const MODEL_VIEWER_SRC = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";

const QUALITY_CHIPS = ["Vue HDR", "Ombres souples", "360°"];

const DemoSection = () => {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const existingScript = document.querySelector(`script[src="${MODEL_VIEWER_SRC}"]`) as HTMLScriptElement | null;

    if (existingScript) {
      const handleLoaded = () => {
        existingScript.dataset.loaded = "true";
        setScriptReady(true);
      };

      if (existingScript.dataset.loaded === "true") {
        setScriptReady(true);
      } else {
        existingScript.addEventListener("load", handleLoaded);
      }

      return () => {
        existingScript.removeEventListener("load", handleLoaded);
      };
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = MODEL_VIEWER_SRC;

    const handleLoad = () => {
      script.dataset.loaded = "true";
      setScriptReady(true);
    };

    script.addEventListener("load", handleLoad);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !viewerRef.current) return;

    const viewer = viewerRef.current;
    const handleLoad = () => setIsLoading(false);
    const handleAnimationFinished = () => setIsUnwrapped(false);

    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("animation-finished", handleAnimationFinished as EventListener);

    return () => {
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("animation-finished", handleAnimationFinished as EventListener);
    };
  }, [scriptReady]);

  useEffect(() => {
    if (scriptReady) {
      setIsLoading(true);
    }
  }, [scriptReady]);

  const handleUnwrap = () => {
    if (!viewerRef.current) {
      return;
    }

    viewerRef.current.animationName = "Unwrap";
    if (typeof viewerRef.current.currentTime === "number") {
      viewerRef.current.currentTime = 0;
    }
    if (typeof viewerRef.current.play === "function") {
      viewerRef.current.play();
    }
    setIsUnwrapped(true);
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
          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, position: "relative" }} elevation={8}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: 4,
                pointerEvents: "none",
                background:
                  "radial-gradient(circle at 20% 20%, rgba(214,161,93,0.18), transparent 70%), radial-gradient(circle at 80% 20%, rgba(214,161,93,0.12), transparent 70%)",
              }}
            />

            <Box
              component="model-viewer"
              ref={viewerRef}
              sx={{
                width: "100%",
                height: { xs: 360, md: 480 },
                borderRadius: 3,
                background: "radial-gradient(circle at center, rgba(0,0,0,0.35), rgba(0,0,0,0.75))",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                display: "block",
              }}
              src="/models/tablette.glb"
              alt="Tablette de chocolat 3D"
              camera-controls
              auto-rotate
              autoplay
              shadow-intensity="1"
              exposure="1.2"
              environment-image="neutral"
              camera-orbit="0deg 70deg 2.1m"
              field-of-view="35deg"
              auto-rotate-delay="2000"
              interaction-prompt="none"
            />

            <Fade in={isLoading} unmountOnExit>
              <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 3,
                  backgroundColor: "rgba(17, 7, 4, 0.8)",
                  backdropFilter: "blur(8px)",
                  zIndex: 2,
                }}
              >
                <CircularProgress color="primary" />
                <Typography variant="body1" color="text.secondary">
                  Préparation de la tablette gourmande…
                </Typography>
              </Stack>
            </Fade>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={4} alignItems="center" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Utilisez la souris pour faire tourner la tablette et la molette pour zoomer.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleUnwrap}
                disabled={!scriptReady || isUnwrapped}
                sx={{ minWidth: 240 }}
              >
                {isUnwrapped ? "Animation en cours…" : "Retirer l'emballage"}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Container>
    </Box>
  );
};

export default DemoSection;
