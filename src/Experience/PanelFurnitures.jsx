import { useSelection, usePointer } from "../stores/selectionStore";
import furnitures from "./furnitures.json";

import * as THREE from "three";

import React, { useMemo, useState, useRef, useEffect } from "react";

import { useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, Box, useGLTF, ContactShadows, useTexture, Decal } from '@react-three/drei';


const imgStyle = {width:100};
const planeZ = 0.001;

function PanelFurnitures() {
  const { currentLibNodeSelection, setCurrentLibNodeSelection } = useSelection();

  return (
    <div style={{ display: "flex", flexDirection: "column", height:'80vh', overflowY:'auto', gap: 10 }}>
      {furnitures.bedroom.map((btn, index) => {
        const isSelected = currentLibNodeSelection?.name === btn.name;

        return (
          <button
            key={index}
            style={{
              width: 120,
              height: 120,
              padding: 0,
              borderRadius: 5,
              border: isSelected ? "4px solid #00a5beff" : "1px solid #666",
              backgroundColor: isSelected ? "#d0ebff" : "white",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setCurrentLibNodeSelection(btn)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isSelected ? "#a3d9d8ff" : "#efefef";
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



export const PointerHighlight = React.forwardRef(({id, pointer, modelFile, rotationIndex }, ref) => {
  const meshRef = ref || React.useRef();
  const [isHovered, setIsHovered] = React.useState(false);
  const {currentSelection, setCurrentSelection} = useSelection();
  const { setPointer } = usePointer();
  const [isMoving, setIsMoving] = useState(false);
  const {addedHighlights, setAddedHighlights} = usePointer();
  const model = modelFile ? useGLTF(modelFile) : null;
  const decalTexture = useTexture('/models/Light Room/shadow-circle.png');

  const onClickHighlight = () => {
    setIsMoving(prev => !prev);
  };

  function updateHighlightPosition(index, newPosition) {
    setAddedHighlights((current) => {
      const newHighlights = [...current];
      newHighlights[index] = {
        ...newHighlights[index],
        position: newPosition,
      };
      return newHighlights;
    });
  }

  useEffect(() => {
    const handleContextMenu = (event) => {
      event.preventDefault(); // Ngăn menu chuột phải mặc định của trình duyệt
      setIsMoving(false); // Dừng di chuyển
      setPointer(null);   // Bỏ chọn đối tượng pointer
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, [setPointer]);

  const [bboxSize, setBboxSize] = React.useState([1, 1]);

  useEffect(() => {
    if (meshRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const size = new THREE.Vector3();
      box.getSize(size);
      setBboxSize([size.x, size.y]); // Lưu kích thước width, height của group
    }
  }, [model]);

  useFrame(({ mouse, raycaster, camera }) => {
    if (isMoving && meshRef.current) {
      raycaster.setFromCamera(mouse, camera);
      const planeZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, intersectPoint);

      meshRef.current.position.x = intersectPoint.x;
      meshRef.current.position.z = intersectPoint.z;

      setPointer(null);
      setCurrentSelection(id);
    }
  });

  // Cập nhật vị trí khi pointer thay đổi ngoài frame move
  useFrame(() => {
    if (meshRef.current)
    {
      if(!isMoving) {
        meshRef.current.position.set(pointer[0], pointer[1] + 0.05, pointer[2]);
      } else {
        updateHighlightPosition
      }
    }
  });

  return (
    <group ref={meshRef} rotation={[0, rotationIndex * Math.PI / 2, 0]} 
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={onClickHighlight}>
      
      {model ? (
        Object.values(model.nodes).map((node, index) => (
          node.geometry && (
            <mesh
              key={index}
              geometry={node.geometry}
              material={model.materials[node.material?.name] || model.materials.default}
              position={node.position}
              rotation={node.rotation}
              scale={isHovered ? node.scale.clone().multiplyScalar(1.1) : node.scale}
              material-transparent={true}
              material-opacity={isHovered ? 0.7 : 1}
            />
          )
        ))
      ) : (
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      )}

      
    </group>
  );
});
