import { useSelection } from "../stores/selectionStore";
import furnitures from "./furnitures.json";

import * as THREE from "three";

import React, { useMemo, useState, useRef, useEffect } from "react";

import { useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, Box, useGLTF, ContactShadows, useTexture, Decal } from '@react-three/drei';


const imgStyle = {width:100};
const planeZ = 0.001;

function PanelFurnitures() {
  const { currentNodeSelection, setCurrentNodeSelection } = useSelection();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {furnitures.bedroom.map((btn, index) => {
        const isSelected = currentNodeSelection?.name === btn.name;

        return (
          <button
            key={index}
            style={{
              width: 120,
              height: 120,
              padding: 0,
              borderRadius: 5,
              border: isSelected ? "2px solid blue" : "1px solid #666",
              backgroundColor: isSelected ? "#d0ebff" : "white",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setCurrentNodeSelection(btn)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isSelected ? "#b3d7ff" : "#efefef";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isSelected ? "#d0ebff" : "white";
            }}
          >
            
            <img src={btn.preview} style={imgStyle} alt={btn.name} />
            {btn.name}
          </button>
        );
      })}
    </div>
  );
}

export default PanelFurnitures;



function BoxWithDecal() {
  const decalTexture = useTexture('/models/Light Room/shadow-circle.png');

  return (
    <mesh position={[1.5, 0, 0.5]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="lightblue" />
      <Decal
        position={[0, 0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={2.5}
        map={decalTexture}
        transparent
      />
    </mesh>
  );
}


// import React, { useRef, useEffect, useMemo } from "react";
// import { useFrame } from "@react-three/fiber";
// import { useGLTF } from "@react-three/drei";
// import { useSelection } from "./SelectionContext";
// import * as THREE from "three";

export function PointerHighlight({ pointer }) {
  const meshRef = useRef();
  const { currentNodeSelection } = useSelection();

  // Chỉ gọi useGLTF khi currentNodeSelection hợp lệ, nếu không thì null
  const model = currentNodeSelection?.file ? useGLTF(currentNodeSelection.file) : null;

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.set(pointer[0], pointer[1] + 0.05, pointer[2]);
  });

  return (
    <group ref={meshRef} rotation={[0, Math.PI / 2, 0]}>
      {/* <ambientLight intensity={0.25} /> */}
      {model ? (
        Object.values(model.nodes).map(
          (node, index) =>
            node.geometry && (
              <mesh
                key={index}
                geometry={node.geometry}
                material={model.materials[node.material?.name] || model.materials.default}
                position={node.position}
                rotation={node.rotation}
                scale={node.scale}
              />
            )
        )
      ) : (
        // Khi không có model, hiển thị box đơn giản
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      )}
    </group>
  );
}