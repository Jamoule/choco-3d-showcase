import { Box } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";

type ChocolateExperienceProps = {
  isUnwrapped: boolean;
  onInteractionChange?: (isInteracting: boolean) => void;
};

type InteractionState = {
  rotationX: number;
  rotationY: number;
  unwrapProgress: number;
  unwrapTarget: number;
  autoRotation: boolean;
  isDragging: boolean;
  lastPointerX: number;
  resumeTimeout: number | null;
  lastFrame: number;
  scale: number;
};

const unwrapLerpSpeed = 2.2;
const wrapLerpSpeed = 3;
const autoRotationSpeedDeg = 14.5;
const resumeDelayMs = 1200;

const BASE_SCENE_WIDTH = 520;
const BASE_SCENE_HEIGHT = 420;

const BAR_WIDTH = 320;
const BAR_DEPTH = 180;
const BAR_HEIGHT = 36;
const TOP_PLATE_HEIGHT = 6;
const SEGMENT_ROWS = 3;
const SEGMENT_COLS = 4;
const SEGMENT_GAP_X = 12;
const SEGMENT_GAP_Z = 14;
const SEGMENT_HEIGHT = 20;

const WRAPPER_WIDTH = BAR_WIDTH + 56;
const WRAPPER_DEPTH = BAR_DEPTH + 32;
const WRAPPER_HEIGHT = BAR_HEIGHT + 24;
const WRAPPER_SEAM_OVERLAP = 6;
const WRAPPER_OPEN_OFFSET = 140;

const FLOOR_DIAMETER = 520;
const FLOOR_DROP = 52;

const lerp = (start: number, end: number, alpha: number) => start + (end - start) * alpha;

const damp = (current: number, target: number, smoothing: number, delta: number) => {
  if (Math.abs(target - current) < 1e-4) {
    return target;
  }
  const factor = 1 - Math.exp(-smoothing * delta);
  return current + (target - current) * factor;
};

type SegmentLayout = {
  positions: { x: number; z: number }[];
  width: number;
  depth: number;
};

const computeSegmentLayout = (): SegmentLayout => {
  const totalGapX = SEGMENT_GAP_X * (SEGMENT_COLS + 1);
  const totalGapZ = SEGMENT_GAP_Z * (SEGMENT_ROWS + 1);

  const width = (BAR_WIDTH - totalGapX) / SEGMENT_COLS;
  const depth = (BAR_DEPTH - totalGapZ) / SEGMENT_ROWS;

  const positions: SegmentLayout["positions"] = [];

  for (let row = 0; row < SEGMENT_ROWS; row += 1) {
    for (let col = 0; col < SEGMENT_COLS; col += 1) {
      const x =
        -BAR_WIDTH / 2 +
        SEGMENT_GAP_X +
        width / 2 +
        col * (width + SEGMENT_GAP_X);
      const z =
        -BAR_DEPTH / 2 +
        SEGMENT_GAP_Z +
        depth / 2 +
        row * (depth + SEGMENT_GAP_Z);
      positions.push({ x, z });
    }
  }

  return { positions, width, depth };
};

type CuboidProps = {
  width: number;
  height: number;
  depth: number;
  transform: string;
  colors: {
    top: string;
    bottom: string;
    front: string;
    back: string;
    left: string;
    right: string;
  };
  topRadius?: number;
  bottomRadius?: number;
};

const faceStyle = (
  width: number,
  height: number,
  transform: string,
  background: string,
  radius?: number
) => ({
  position: "absolute" as const,
  width: `${width}px`,
  height: `${height}px`,
  transform,
  background,
  borderRadius: radius !== undefined ? `${radius}px` : undefined,
  backfaceVisibility: "hidden" as const,
});

const Cuboid = ({ width, height, depth, transform, colors, topRadius, bottomRadius }: CuboidProps) => (
  <Box
    sx={{
      position: "absolute",
      width: 0,
      height: 0,
      transformStyle: "preserve-3d",
      transform,
    }}
  >
    <Box sx={faceStyle(width, depth, `rotateX(-90deg) translateZ(${height / 2}px)`, colors.top, topRadius)} />
    <Box sx={faceStyle(width, depth, `rotateX(90deg) translateZ(${height / 2}px)`, colors.bottom, bottomRadius)} />
    <Box sx={faceStyle(width, height, `translateZ(${depth / 2}px)`, colors.front)} />
    <Box sx={faceStyle(width, height, `rotateY(180deg) translateZ(${depth / 2}px)`, colors.back)} />
    <Box sx={faceStyle(depth, height, `rotateY(90deg) translateZ(${width / 2}px)`, colors.right)} />
    <Box sx={faceStyle(depth, height, `rotateY(-90deg) translateZ(${width / 2}px)`, colors.left)} />
  </Box>
);

const ChocolateExperience = ({ isUnwrapped, onInteractionChange }: ChocolateExperienceProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const leftWrapperRef = useRef<HTMLDivElement | null>(null);
  const rightWrapperRef = useRef<HTMLDivElement | null>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const onInteractionChangeRef = useRef(onInteractionChange);

  const segmentLayout = useMemo(() => computeSegmentLayout(), []);

  const stateRef = useRef<InteractionState>({
    rotationX: 20,
    rotationY: -35,
    unwrapProgress: isUnwrapped ? 1 : 0,
    unwrapTarget: isUnwrapped ? 1 : 0,
    autoRotation: true,
    isDragging: false,
    lastPointerX: 0,
    resumeTimeout: null,
    lastFrame: performance.now(),
    scale: 1,
  });

  onInteractionChangeRef.current = onInteractionChange;

  useEffect(() => {
    stateRef.current.unwrapTarget = isUnwrapped ? 1 : 0;
  }, [isUnwrapped]);

  useEffect(() => {
    const container = containerRef.current;
    const scene = sceneRef.current;
    const leftWrapper = leftWrapperRef.current;
    const rightWrapper = rightWrapperRef.current;
    const sheen = sheenRef.current;
    const overlay = overlayRef.current;

    if (!container || !scene || !leftWrapper || !rightWrapper || !sheen || !overlay) {
      return;
    }

    const state = stateRef.current;
    state.lastFrame = performance.now();

    const rect = container.getBoundingClientRect();
    state.scale = Math.max(
      Math.min(rect.width / BASE_SCENE_WIDTH, rect.height / BASE_SCENE_HEIGHT),
      0.55
    );

    const leftBaseX = -(WRAPPER_WIDTH / 4) - WRAPPER_SEAM_OVERLAP / 2;
    const rightBaseX = WRAPPER_WIDTH / 4 + WRAPPER_SEAM_OVERLAP / 2;

    const updateSceneTransform = () => {
      scene.style.transform = `translate3d(-50%, -50%, 0) scale(${state.scale}) rotateX(${state.rotationX}deg) rotateY(${state.rotationY}deg)`;
    };

    updateSceneTransform();
    overlay.style.cursor = "grab";

    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - state.lastFrame) / 1000, 0.1);
      state.lastFrame = now;

      const target = state.unwrapTarget;
      const progress = state.unwrapProgress;
      const speed = target > progress ? unwrapLerpSpeed : wrapLerpSpeed;
      state.unwrapProgress = damp(progress, target, speed, delta);

      const nextProgress = state.unwrapProgress;

      const targetX = lerp(-10, 15, nextProgress);
      state.rotationX = damp(state.rotationX, targetX, 4, delta);

      if (state.autoRotation && !state.isDragging) {
        state.rotationY += autoRotationSpeedDeg * delta;
      }

      const offset = lerp(0, WRAPPER_OPEN_OFFSET, nextProgress);
      const wrapperRotation = lerp(0, 15, nextProgress);

      leftWrapper.style.transform = `translate3d(${leftBaseX - offset}px, 0, 0) rotateY(${wrapperRotation}deg)`;
      rightWrapper.style.transform = `translate3d(${rightBaseX + offset}px, 0, 0) rotateY(${-wrapperRotation}deg)`;
      sheen.style.opacity = (0.3 + nextProgress * 0.7).toFixed(3);

      updateSceneTransform();
      frameId = requestAnimationFrame(animate);
    };

    let frameId = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const scale = Math.min(entry.contentRect.width / BASE_SCENE_WIDTH, entry.contentRect.height / BASE_SCENE_HEIGHT);
      state.scale = Math.max(scale, 0.55);
    });

    resizeObserver.observe(container);

    const clearResumeTimeout = () => {
      if (state.resumeTimeout !== null) {
        window.clearTimeout(state.resumeTimeout);
        state.resumeTimeout = null;
      }
    };

    const scheduleAutoRotation = () => {
      clearResumeTimeout();
      state.resumeTimeout = window.setTimeout(() => {
        state.autoRotation = true;
        state.resumeTimeout = null;
      }, resumeDelayMs);
    };

    const handlePointerDown = (event: PointerEvent) => {
      state.isDragging = true;
      state.lastPointerX = event.clientX;
      state.autoRotation = false;
      clearResumeTimeout();
      overlay.style.cursor = "grabbing";
      onInteractionChangeRef.current?.(true);
      overlay.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!state.isDragging) {
        return;
      }
      const deltaX = event.clientX - state.lastPointerX;
      state.lastPointerX = event.clientX;
      state.rotationY += deltaX * 0.35;
    };

    const endInteraction = () => {
      if (!state.isDragging) {
        return;
      }
      state.isDragging = false;
      overlay.style.cursor = "grab";
      onInteractionChangeRef.current?.(false);
      scheduleAutoRotation();
    };

    const handlePointerUp = (event: PointerEvent) => {
      endInteraction();
      if (overlay.releasePointerCapture) {
        try {
          overlay.releasePointerCapture(event.pointerId);
        } catch (error) {
          // Ignore release failures when pointer capture was not set
        }
      }
    };

    const handlePointerLeave = () => {
      endInteraction();
    };

    overlay.addEventListener("pointerdown", handlePointerDown);
    overlay.addEventListener("pointermove", handlePointerMove);
    overlay.addEventListener("pointerup", handlePointerUp);
    overlay.addEventListener("pointerleave", handlePointerLeave);
    overlay.addEventListener("pointercancel", handlePointerLeave);

    return () => {
      clearResumeTimeout();
      resizeObserver.disconnect();
      cancelAnimationFrame(frameId);
      overlay.removeEventListener("pointerdown", handlePointerDown);
      overlay.removeEventListener("pointermove", handlePointerMove);
      overlay.removeEventListener("pointerup", handlePointerUp);
      overlay.removeEventListener("pointerleave", handlePointerLeave);
      overlay.removeEventListener("pointercancel", handlePointerLeave);
    };
  }, []);

  return (
    <Box sx={{ position: "relative", width: "100%", height: { xs: 360, md: 480 } }}>
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 3,
          overflow: "hidden",
          background: "radial-gradient(circle at 50% 10%, #231007 0%, #0c0402 65%, #060201 100%)",
          perspective: "1600px",
        }}
      >
        <Box
          ref={sceneRef}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transformStyle: "preserve-3d",
            transform: "translate3d(-50%, -50%, 0)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: `${FLOOR_DIAMETER}px`,
              height: `${FLOOR_DIAMETER}px`,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(33,15,7,0.9) 0%, rgba(15,7,4,0.35) 55%, rgba(10,4,2,0) 100%)",
              transform: `translate3d(${-FLOOR_DIAMETER / 2}px, ${FLOOR_DROP}px, ${-FLOOR_DIAMETER / 2}px) rotateX(90deg)`,
              boxShadow: "0 80px 120px rgba(0,0,0,0.55)",
            }}
          />

          <Cuboid
            width={BAR_WIDTH}
            height={BAR_HEIGHT}
            depth={BAR_DEPTH}
            transform={`translate3d(${-BAR_WIDTH / 2}px, ${-BAR_HEIGHT / 2}px, ${-BAR_DEPTH / 2}px)`}
            colors={{
              top: "linear-gradient(180deg, #6b371d 0%, #4f2a16 55%, #3a1c0d 100%)",
              bottom: "#140702",
              front: "linear-gradient(180deg, #3a1c0d 0%, #1f0c05 100%)",
              back: "linear-gradient(180deg, #3a1c0d 0%, #1f0c05 100%)",
              left: "linear-gradient(180deg, #2f1509 0%, #140702 100%)",
              right: "linear-gradient(180deg, #2f1509 0%, #140702 100%)",
            }}
            topRadius={22}
            bottomRadius={22}
          />

          <Cuboid
            width={BAR_WIDTH - 12}
            height={TOP_PLATE_HEIGHT}
            depth={BAR_DEPTH - 12}
            transform={`translate3d(${- (BAR_WIDTH - 12) / 2}px, ${-BAR_HEIGHT / 2 - TOP_PLATE_HEIGHT / 2}px, ${- (BAR_DEPTH - 12) / 2}px)`}
            colors={{
              top: "linear-gradient(180deg, #7c4527 0%, #5a2e18 65%, #3a1c0d 100%)",
              bottom: "#2a1308",
              front: "linear-gradient(180deg, #4b2412 0%, #2a1308 100%)",
              back: "linear-gradient(180deg, #4b2412 0%, #2a1308 100%)",
              left: "linear-gradient(180deg, #3c1b0d 0%, #1f0c05 100%)",
              right: "linear-gradient(180deg, #3c1b0d 0%, #1f0c05 100%)",
            }}
            topRadius={18}
            bottomRadius={16}
          />

          {segmentLayout.positions.map((segment) => (
            <Cuboid
              key={`${segment.x}-${segment.z}`}
              width={segmentLayout.width}
              height={SEGMENT_HEIGHT}
              depth={segmentLayout.depth}
              transform={`translate3d(${segment.x}px, ${-BAR_HEIGHT / 2 - TOP_PLATE_HEIGHT - SEGMENT_HEIGHT / 2}px, ${segment.z}px)`}
              colors={{
                top: "linear-gradient(180deg, #8a5430 0%, #6d3c20 70%, #4b2312 100%)",
                bottom: "#2a1308",
                front: "linear-gradient(180deg, #4d2613 0%, #2a1308 100%)",
                back: "linear-gradient(180deg, #4d2613 0%, #2a1308 100%)",
                left: "linear-gradient(180deg, #3a1c0d 0%, #1c0a04 100%)",
                right: "linear-gradient(180deg, #3a1c0d 0%, #1c0a04 100%)",
              }}
              topRadius={10}
              bottomRadius={6}
            />
          ))}

          <Box
            ref={leftWrapperRef}
            sx={{
              position: "absolute",
              transformStyle: "preserve-3d",
              transformOrigin: "100% 50%",
            }}
          >
            <Cuboid
              width={WRAPPER_WIDTH / 2}
              height={WRAPPER_HEIGHT}
              depth={WRAPPER_DEPTH}
              transform={`translate3d(${-WRAPPER_WIDTH / 4}px, ${-WRAPPER_HEIGHT / 2}px, ${-WRAPPER_DEPTH / 2}px)`}
              colors={{
                top: "linear-gradient(135deg, #b77a27 0%, #8f4f11 60%, #5b2c09 100%)",
                bottom: "#2b1205",
                front: "linear-gradient(180deg, #8f4f11 0%, #5b2c09 100%)",
                back: "linear-gradient(180deg, #8f4f11 0%, #5b2c09 100%)",
                left: "linear-gradient(180deg, #6d3b12 0%, #3a1c0d 100%)",
                right: "linear-gradient(180deg, #814913 0%, #4a230b 100%)",
              }}
              topRadius={18}
              bottomRadius={12}
            />
            <Box
              sx={{
                position: "absolute",
                width: `${WRAPPER_WIDTH / 2}px`,
                height: `${WRAPPER_DEPTH}px`,
                transform: `translate3d(${-WRAPPER_WIDTH / 4}px, ${-WRAPPER_HEIGHT / 2 - 2}px, ${-WRAPPER_DEPTH / 2}px) rotateX(-90deg)`,
                background: "linear-gradient(120deg, rgba(255,226,170,0.5) 0%, rgba(255,255,255,0.2) 40%, rgba(255,205,120,0.6) 80%, rgba(255,255,255,0.05) 100%)",
                opacity: 0.65,
                pointerEvents: "none",
                mixBlendMode: "screen",
              }}
            />
          </Box>

          <Box
            ref={rightWrapperRef}
            sx={{
              position: "absolute",
              transformStyle: "preserve-3d",
              transformOrigin: "0% 50%",
            }}
          >
            <Cuboid
              width={WRAPPER_WIDTH / 2}
              height={WRAPPER_HEIGHT}
              depth={WRAPPER_DEPTH}
              transform={`translate3d(${-WRAPPER_WIDTH / 4}px, ${-WRAPPER_HEIGHT / 2}px, ${-WRAPPER_DEPTH / 2}px)`}
              colors={{
                top: "linear-gradient(135deg, #c38a2f 0%, #a26117 55%, #70370d 100%)",
                bottom: "#2b1205",
                front: "linear-gradient(180deg, #a26117 0%, #70370d 100%)",
                back: "linear-gradient(180deg, #a26117 0%, #70370d 100%)",
                left: "linear-gradient(180deg, #8f5316 0%, #4d250c 100%)",
                right: "linear-gradient(180deg, #7c4312 0%, #3f1d08 100%)",
              }}
              topRadius={18}
              bottomRadius={12}
            />
            <Box
              sx={{
                position: "absolute",
                width: `${WRAPPER_WIDTH / 2}px`,
                height: `${WRAPPER_DEPTH}px`,
                transform: `translate3d(${-WRAPPER_WIDTH / 4}px, ${-WRAPPER_HEIGHT / 2 - 2}px, ${-WRAPPER_DEPTH / 2}px) rotateX(-90deg)`,
                background: "linear-gradient(120deg, rgba(255,240,205,0.55) 0%, rgba(255,255,255,0.18) 45%, rgba(255,220,150,0.6) 85%, rgba(255,255,255,0.08) 100%)",
                opacity: 0.65,
                pointerEvents: "none",
                mixBlendMode: "screen",
              }}
            />
          </Box>

          <Box
            ref={sheenRef}
            sx={{
              position: "absolute",
              width: `${WRAPPER_WIDTH}px`,
              height: `${WRAPPER_DEPTH}px`,
              transform: `translate3d(${-WRAPPER_WIDTH / 2}px, ${-WRAPPER_HEIGHT / 2 - 24}px, ${-WRAPPER_DEPTH / 2}px) rotateX(-60deg) rotateZ(22deg)`,
              background: "linear-gradient(120deg, rgba(255, 233, 180, 0.6) 0%, rgba(255, 255, 255, 0.1) 60%, rgba(255, 220, 150, 0.45) 100%)",
              opacity: 0.6,
              pointerEvents: "none",
              mixBlendMode: "screen",
              filter: "blur(2px)",
            }}
          />
        </Box>
      </Box>

      <Box ref={overlayRef} sx={{ position: "absolute", inset: 0, zIndex: 2 }} />
    </Box>
  );
};

export default ChocolateExperience;
