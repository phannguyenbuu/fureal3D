import * as THREE from "three";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useToggleRoomStore } from "../../stores/toggleRoomStore";

import gsap from "gsap";
import { useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, Box, useGLTF, ContactShadows, useTexture, Decal } from '@react-three/drei';
import { PointerHighlight } from "../PanelFurnitures";

import { useSelection, usePointer } from "../../stores/selectionStore";

const planeZ = 0.001;

const Plane = ({ row, column, position, planeDepth, planeWidth, 
  setPointerPosition, setAddedHighlights, modelFile, data}) => {

  const { setMessage, currentLibNodeSelection, 
    setCurrentLibNodeSelection, 
    currentSelection, setCurrentSelection
    
  } = useSelection();

  const {directionAxis, setDirectionAxis, getResult} = usePointer();


  const meshRef = useRef();
  const {setPointer, setPointerIdPosition} = usePointer();
  const [hovered, setHovered] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const { isDarkRoom, isTransitioning } = useToggleRoomStore();
  const {rotationIndex} = usePointer();

  useEffect(() => {

    // setMessage("Parse data");
    if(!data || !data.zone || data.zone.length !== 4) return;
    
    if(!(row >= data.zone[0] && row <= data.zone[2] 
      && column >= data.zone[1] && column <= data.zone[3] )
    )
    {
      // setMessage(`Vật thể không nằm trong phòng ${data.zone} ${row} ${column}`);
    }else{
      // setMessage(`Vị trí thích hợp ${rotationIndex} ${directionAxis}`);
    }
    
    },[hovered]);

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


    const bbox = new THREE.Box3().setFromObject(meshRef.current);
    // console.log("Point Box Min:", bbox.min);
    // console.log("Point Box Max:", bbox.max);
  });

  return (
    
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      onPointerMove={() => {
        if (isTransitioning) return;
        // setMessage(`${row}-${column}`);
        setPointerPosition(position);
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
      onClick={() => {
        // console.log("OnClick", currentLibNodeSelection, currentSelection);
        if(!currentLibNodeSelection)
        {
          if(currentSelection)
          {
            setPointerIdPosition(currentSelection, position);
            
          }
        }else{

          setAddedHighlights((current) => {
            const index = current.findIndex(
              (item) =>
                Math.abs(item.position[0] - position[0]) < 0.001 &&
                Math.abs(item.position[1] - position[1]) < 0.001 &&
                Math.abs(item.position[2] - position[2]) < 0.001
            );

            if (index !== -1) {
              const newHighlights = [...current];
              newHighlights[index] = {
                ...newHighlights[index],
                data: data,
                rotationIndex: rotationIndex,
              };
              setPointer(current);
              
              return newHighlights;
            } else {
              const uniqueId = `${data.name}-${Date.now()}`;
              const newList = [...current, { id: uniqueId, position, modelFile, data, rotationIndex: 0 }];
              setPointer(newList[newList.length - 1]);
              return newList;
            }
          });
          
        }

        setCurrentSelection(null);
        setCurrentLibNodeSelection(null);
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
  
  const { currentLibNodeSelection, setCurrentLibNodeSelection, currentSelection  } = useSelection();
  const { setPointer} = usePointer();
  const {addedHighlights, setAddedHighlights} = usePointer();
  const pointerRef = useRef();
  const [pointerPosition, setPointerPosition] = useState([0, 0, 0]);

  const [selectedHighlightIndex, setSelectedHighlightIndex] = useState(null);
  // const [pointerPosition, setPointerPosition] = useState([0, 0, 0]);
  const [currentModelFile, setCurrentModelFile] = useState(null);
  const [rotationIndex, setRotationIndex] = useState(0);
  // const [addedHighlights, setAddedHighlights] = useState([]);

  const onSelectHighlight = (index) => {
    const highlight = addedHighlights[index];

    // Xóa phần tử khỏi danh sách
    setAddedHighlights((prev) => prev.filter((_, i) => i !== index));

    // Lưu lại ở pointer chính các giá trị để chỉnh sửa
    setSelectedHighlightIndex(index);
    setPointerPosition(highlight.position);
    setCurrentModelFile(highlight.modelFile);
    setRotationIndex(highlight.rotationIndex || 0);
  }



  const gridWidth = columns * (planeWidth + spacing) - spacing;
  const gridDepth = columns * (planeDepth + spacing) - spacing;

  const startX = planeWidth / 2 - gridWidth / 2;
  const startZ = planeDepth / 2 - gridDepth / 2;

  useEffect(() => {
    if (pointerRef.current) {
      setPointer(pointerRef.current);
    }
  }, [pointerRef.current, currentLibNodeSelection]);


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
                id={`plane-${row}-${column}`}
                row = {row} column={column}
                planeDepth={planeDepth}
                planeWidth={planeWidth}
                position={[x, planeZ, z]}
                setPointerPosition={setPointerPosition}
                setAddedHighlights={setAddedHighlights}
                modelFile={currentLibNodeSelection?.file}
                data={currentLibNodeSelection}
              />
            );
          })
        )}

        {currentLibNodeSelection  &&
        <PointerHighlight ref={pointerRef} rotationIndex={rotationIndex}
           pointer={pointerPosition} modelFile={currentLibNodeSelection?.file}/>}

        {/* {addedHighlights.map((pos, index) => (
          <PointerHighlight key={index} pointer={pos} />
        ))} */}

        {addedHighlights.map(({id, position, modelFile, rotationIndex }, index) => (
          <PointerHighlight key={index} id={id} pointer={position} modelFile={modelFile} 
            rotationIndex={rotationIndex}
            onClick={() => onSelectHighlight(index)}
          />
        ))}


      </group>

      
    </>
  );
};

export default GridPlanes;
