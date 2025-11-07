import { Box, Button, Chip, CircularProgress, Container, Fade, Paper, Stack, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { useEffect, useRef, useState } from "react";

type ModelViewerElement = HTMLElement & {
  animationName?: string;
  currentTime?: number;
  play?: () => void;
  pause?: () => void;
};

const MODEL_VIEWER_SRC = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";

const QUALITY_CHIPS = ["Vue HDR", "Ombres souples", "360°"];
const UNWRAP_DURATION = 1500;

const foilSheen = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const DemoSection = () => {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [wrapperState, setWrapperState] = useState<"wrapped" | "animating" | "unwrapped">("wrapped");
  const [isLoading, setIsLoading] = useState(true);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const handleAnimationFinished = () => {
      viewer.animationName = undefined;
    };

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

  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const handleUnwrap = () => {
    if (!viewerRef.current || wrapperState === "animating") {
      return;
    }

    if (wrapperState === "unwrapped") {
      setWrapperState("wrapped");
      return;
    }

    viewerRef.current.animationName = "Unwrap";
    if (typeof viewerRef.current.currentTime === "number") {
      viewerRef.current.currentTime = 0;
    }
    if (typeof viewerRef.current.play === "function") {
      viewerRef.current.play();
    }

    setWrapperState("animating");
    animationTimerRef.current = setTimeout(() => {
      setWrapperState("unwrapped");
      animationTimerRef.current = null;
    }, UNWRAP_DURATION);
  };

  const getPanelTransform = (side: "left" | "right") => {
    if (wrapperState === "wrapped") {
      return "translateX(0)";
    }
    const translate = side === "left" ? "translateX(-110%)" : "translateX(110%)";
    if (wrapperState === "animating") {
      const rotation = side === "left" ? " rotateY(-6deg)" : " rotateY(6deg)";
      return `${translate}${rotation}`;
    }
    return translate;
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

            <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden" }}>
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

              {wrapperState !== "unwrapped" && (
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 3,
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "opacity 0.4s ease",
                    opacity: wrapperState === "animating" ? 0.95 : 1,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      background: "linear-gradient(135deg, rgba(107,63,21,0.95) 0%, rgba(218,171,94,0.85) 45%, rgba(107,63,21,0.95) 90%)",
                      backgroundSize: "200% 200%",
                      animation: `${foilSheen} 6s linear infinite`,
                      transform: getPanelTransform("left"),
                      transition: "transform 1.2s cubic-bezier(0.6, 0.05, 0.2, 0.9)",
                      borderRight: "1px solid rgba(255,255,255,0.25)",
                      boxShadow: "inset -8px 0 20px rgba(0,0,0,0.4)",
                    }}
                  />
                  <Box
                    sx={{
                      flex: 1,
                      background: "linear-gradient(225deg, rgba(107,63,21,0.95) 0%, rgba(218,171,94,0.85) 45%, rgba(107,63,21,0.95) 90%)",
                      backgroundSize: "200% 200%",
                      animation: `${foilSheen} 6s linear infinite`,
                      transform: getPanelTransform("right"),
                      transition: "transform 1.2s cubic-bezier(0.6, 0.05, 0.2, 0.9)",
                      borderLeft: "1px solid rgba(255,255,255,0.25)",
                      boxShadow: "inset 8px 0 20px rgba(0,0,0,0.4)",
                    }}
                  />

                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      background: "rgba(33, 15, 7, 0.7)",
                      borderRadius: 3,
                      px: 4,
                      py: 2.5,
                      border: "1px solid rgba(255,255,255,0.15)",
                      boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
                      transition: "opacity 0.5s ease, transform 0.5s ease",
                      opacity: wrapperState === "wrapped" ? 1 : 0,
                      transform:
                        wrapperState === "wrapped"
                          ? "translate(-50%, -50%) scale(1)"
                          : "translate(-50%, -50%) scale(0.9)",
                      transformOrigin: "center",
                    }}
                  >
                    <Typography variant="h5" fontWeight={700} letterSpacing={2} sx={{ textTransform: "uppercase" }}>
                      ChocoLuxe
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.75)">
                      Emballage Premium
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>

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
                disabled={!scriptReady || wrapperState === "animating"}
                sx={{ minWidth: 240 }}
              >
                {wrapperState === "animating"
                  ? "Retrait en cours…"
                  : wrapperState === "unwrapped"
                  ? "Réactiver l'emballage"
                  : "Retirer l'emballage"}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Container>
    </Box>
  );
};

export default DemoSection;
