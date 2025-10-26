import * as THREE from "three";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useToggleRoomStore } from "../../stores/toggleRoomStore";

import gsap from "gsap";
import { useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, Box, useGLTF, ContactShadows, useTexture, Decal } from '@react-three/drei';
import { PointerHighlight } from "../PanelFurnitures";

import { useSelection } from "../../stores/selectionStore";

const planeZ = 0.001;

const Plane = ({ position, planeDepth, planeWidth, setPointerPosition, setAddedHighlights }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const { isDarkRoom, isTransitioning } = useToggleRoomStore();

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#ffffff",
      emissive: "#ffffff",
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0,
    });
  }, []);
  

  useEffect(() => {
    if (!meshRef.current) return;

    const material = meshRef.current.material;
    const targetColor = isDarkRoom ? "#ffffff" : "#000000";
    const targetColorObj = new THREE.Color(targetColor);

    gsap.to(material.color, {
      r: targetColorObj.r,
      g: targetColorObj.g,
      b: targetColorObj.b,
    });
    gsap.to(material.emissive, {
      r: targetColorObj.r,
      g: targetColorObj.g,
      b: targetColorObj.b,
    });
  }, [isDarkRoom]);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetOpacity = hovered ? 0.8 : 0;
    let lerpFactor = hovered ? 0.1 : 0.03;
    if (isTransitioning) {
      lerpFactor = 0.15;
    }
    setOpacity(THREE.MathUtils.lerp(opacity, targetOpacity, lerpFactor));
    meshRef.current.material.opacity = opacity;
    meshRef.current.emissiveIntensity = hovered ? 1.5 : 0.8;
  });

  return (
    
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      onPointerMove={() => {
        if (isTransitioning) return;
        setPointerPosition(position);
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
      onClick={() => {
        setAddedHighlights((current) => {
          // Kiểm tra có phần tử nào trong current có vị trí trùng với position không
          const exists = current.some(
            (pos) =>
              Math.abs(pos[0] - position[0]) < 0.001 &&
              Math.abs(pos[1] - position[1]) < 0.001 &&
              Math.abs(pos[2] - position[2]) < 0.001
          );
          if (exists) {
            return current; // Nếu đã tồn tại, không thêm
          }
          return [...current, position]; // Thêm vị trí mới nếu chưa tồn tại
        });
      }}

    >
      <planeGeometry args={[planeDepth, planeWidth]} />
      
      
    </mesh>
  );
};















const GridPlanes = ({
  position,
  rows,
  columns,
  planeWidth,
  planeDepth,
  spacing,
  ref,
}) => {
  const [addedHighlights, setAddedHighlights] = useState([]);
  const [pointerPosition, setPointerPosition] = useState([0, 0, 0]);

  const gridWidth = columns * (planeWidth + spacing) - spacing;
  const gridDepth = columns * (planeDepth + spacing) - spacing;

  const startX = planeWidth / 2 - gridWidth / 2;
  const startZ = planeDepth / 2 - gridDepth / 2;

  return (
    <>
      <group ref={ref}>
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: columns }).map((_, column) => {
            const x = startX + column * (planeWidth + spacing);
            const z = startZ + row * (planeDepth + spacing);
            return (
              <Plane
                key={`plane-${row}-${column}`}
                planeDepth={planeDepth}
                planeWidth={planeWidth}
                position={[x, planeZ, z]}
                setPointerPosition={setPointerPosition}
                setAddedHighlights={setAddedHighlights}
              />
            );
          })
        )}

        <PointerHighlight pointer={pointerPosition} />

        {addedHighlights.map((pos, index) => (
          <PointerHighlight key={index} pointer={pos} />
        ))}

      </group>

      
    </>
  );
};

export default GridPlanes;
