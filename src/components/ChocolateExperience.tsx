import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Box, Stack } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import type { Group, Mesh, MeshStandardMaterial, PerspectiveCamera } from "three";
import { Color, Euler, MathUtils, Vector3 } from "three";

const unwrapLerpSpeed = 2;
const wrapLerpSpeed = 3;
const autoRotationSpeed = 0.25;

type ChocolateExperienceProps = {
  isUnwrapped: boolean;
  onInteractionChange?: (isInteracting: boolean) => void;
};

const createSegmentPositions = () => {
  const positions: [number, number, number][] = [];
  const columns = 4;
  const rows = 3;
  const padding = 0.08;
  const segmentWidth = 0.9 / columns;
  const segmentHeight = 0.6 / rows;

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      positions.push([
        (x - (columns - 1) / 2) * (segmentWidth + padding),
        0.15,
        (y - (rows - 1) / 2) * (segmentHeight + padding),
      ]);
    }
  }

  return positions;
};

const segmentPositions = createSegmentPositions();

const ChocolateModel = ({
  targetUnwrapped,
  onInteractionChange,
}: {
  targetUnwrapped: boolean;
  onInteractionChange?: (isInteracting: boolean) => void;
}) => {
  const groupRef = useRef<Group>(null);
  const leftWrapperRef = useRef<Group>(null);
  const rightWrapperRef = useRef<Group>(null);
  const sheenRef = useRef<Mesh>(null);
  const interactionRef = useRef({ isDragging: false, lastX: 0 });
  const unwrapProgressRef = useRef(targetUnwrapped ? 1 : 0);
  const unwrapTargetRef = useRef(targetUnwrapped ? 1 : 0);
  const autoRotationRef = useRef(true);
  const cameraTarget = useMemo(() => new Vector3(0, 1.8, 4.3), []);
  const baseRotation = useMemo(() => new Euler(MathUtils.degToRad(20), 0, 0), []);

  const chocolateColor = useMemo(() => new Color("#4f2a16"), []);
  const wrapperPrimary = useMemo(() => new Color("#a66b22"), []);
  const wrapperSecondary = useMemo(() => new Color("#f2cf8d"), []);

  unwrapTargetRef.current = targetUnwrapped ? 1 : 0;

  useFrame((state, delta) => {
    const progress = unwrapProgressRef.current;
    const target = unwrapTargetRef.current;
    const speed = target > progress ? unwrapLerpSpeed : wrapLerpSpeed;
    const nextProgress = MathUtils.damp(progress, target, speed, delta);
    unwrapProgressRef.current = nextProgress;

    if (leftWrapperRef.current && rightWrapperRef.current) {
      const offset = MathUtils.lerp(0, 1.6, nextProgress);
      const rotation = MathUtils.lerp(0, MathUtils.degToRad(15), nextProgress);
      leftWrapperRef.current.position.set(-offset / 2, 0.05, 0);
      leftWrapperRef.current.rotation.set(0, rotation, 0);
      rightWrapperRef.current.position.set(offset / 2, 0.05, 0);
      rightWrapperRef.current.rotation.set(0, -rotation, 0);
    }

    if (sheenRef.current) {
      const sheenIntensity = 0.3 + nextProgress * 0.7;
      const material = sheenRef.current.material as MeshStandardMaterial | MeshStandardMaterial[];
      if (Array.isArray(material)) {
        material.forEach((mat) => {
          mat.opacity = sheenIntensity;
        });
      } else {
        material.opacity = sheenIntensity;
      }
    }

    if (groupRef.current) {
      if (autoRotationRef.current) {
        groupRef.current.rotation.y += delta * autoRotationSpeed;
      }
      const targetX = MathUtils.lerp(MathUtils.degToRad(-10), MathUtils.degToRad(15), nextProgress);
      groupRef.current.rotation.x = MathUtils.damp(
        groupRef.current.rotation.x,
        targetX,
        4,
        delta
      );
    }

    const camera = state.camera as PerspectiveCamera;
    camera.position.lerp(cameraTarget, delta * 0.6);
    camera.lookAt(0, 0.4, 0);
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    interactionRef.current = { isDragging: true, lastX: event.clientX };
    autoRotationRef.current = false;
    onInteractionChange?.(true);
  };

  const handlePointerUp = () => {
    if (interactionRef.current.isDragging) {
      interactionRef.current.isDragging = false;
      onInteractionChange?.(false);
      window.setTimeout(() => {
        autoRotationRef.current = true;
      }, 1200);
    }
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!interactionRef.current.isDragging || !groupRef.current) {
      return;
    }
    const deltaX = event.clientX - interactionRef.current.lastX;
    interactionRef.current.lastX = event.clientX;
    groupRef.current.rotation.y += deltaX * 0.005;
  };

  return (
    <group ref={groupRef} rotation={baseRotation}>
      <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial color="#150905" roughness={1} metalness={0.1} />
      </mesh>

      <group>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.25, 0.8]} />
          <meshStandardMaterial color={chocolateColor} roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.18, 0.04, 0.78]} />
          <meshStandardMaterial color={chocolateColor.clone().offsetHSL(0, -0.08, 0.08)} roughness={0.35} />
        </mesh>
        {segmentPositions.map((coords, index) => (
          <mesh key={index} position={coords} castShadow receiveShadow>
            <boxGeometry args={[0.22, 0.12, 0.18]} />
            <meshStandardMaterial color={chocolateColor.clone().offsetHSL(0, -0.04, 0.12)} roughness={0.25} />
          </mesh>
        ))}
      </group>

      <group ref={leftWrapperRef} position={[-0.01, 0.05, 0]} onPointerDown={handlePointerDown}>
        <mesh castShadow>
          <boxGeometry args={[1.26, 0.28, 0.84]} />
          <meshStandardMaterial color={wrapperPrimary} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[1.24, 0.02, 0.82]} />
          <meshStandardMaterial color={wrapperSecondary} metalness={0.85} roughness={0.15} />
        </mesh>
      </group>

      <group ref={rightWrapperRef} position={[0.01, 0.05, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.26, 0.28, 0.84]} />
          <meshStandardMaterial color={wrapperPrimary} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[1.24, 0.02, 0.82]} />
          <meshStandardMaterial color={wrapperSecondary} metalness={0.85} roughness={0.15} />
        </mesh>
      </group>

      <mesh ref={sheenRef} position={[0, 0.27, 0]} rotation={[MathUtils.degToRad(90), 0, MathUtils.degToRad(25)]}>
        <planeGeometry args={[1.4, 0.9]} />
        <meshStandardMaterial
          transparent
          opacity={0.3}
          color="#ffe9b3"
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>

      <mesh
        onPointerDown={(event) => handlePointerDown(event)}
        onPointerUp={handlePointerUp}
        onPointerMove={(event) => handlePointerMove(event)}
        position={[0, 0.1, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

const ChocolateExperience = ({ isUnwrapped, onInteractionChange }: ChocolateExperienceProps) => {
  const [isInteracting, setIsInteracting] = useState(false);

  const handleInteractionChange = (value: boolean) => {
    setIsInteracting(value);
    onInteractionChange?.(value);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: { xs: 360, md: 480 } }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.8, 4.3], fov: 35 }}
        style={{ borderRadius: 24, background: "radial-gradient(circle at center, #150905, #090402)" }}
        onPointerUp={() => handleInteractionChange(false)}
      >
        <color attach="background" args={["#0d0603"]} />
        <hemisphereLight intensity={0.55} color="#ffe9b3" groundColor="#120802" />
        <directionalLight
          position={[4, 6, 6]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, 5, -4]} intensity={0.6} color="#ffb977" />
        <ChocolateModel targetUnwrapped={isUnwrapped} onInteractionChange={handleInteractionChange} />
      </Canvas>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          bgcolor: "rgba(12, 6, 3, 0.45)",
          px: 2,
          py: 1,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.85)",
          fontSize: 13,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {isInteracting ? "Rotation manuelle" : "Rotation automatique"}
      </Stack>
    </Box>
  );
};

export default ChocolateExperience;

