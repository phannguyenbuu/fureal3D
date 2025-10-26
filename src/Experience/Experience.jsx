import * as THREE from "three";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import Scene from "./Scene";
import { Canvas } from "@react-three/fiber";

import { OrthographicCamera, Box, OrbitControls} from "@react-three/drei";
import { Environment } from '@react-three/drei';

import { useToggleRoomStore } from "../stores/toggleRoomStore";
import { useResponsiveStore } from "../stores/useResponsiveStore";
import { useExperienceStore } from "../stores/experienceStore";


import PanelFurnitures from "./PanelFurnitures";


const Experience = () => {
  const cameraRef = useRef();
  const pointerRef = useRef({ x: 0, y: 0 });
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const { isExperienceReady } = useExperienceStore();
  
  const { isMobile } = useResponsiveStore();

  const { isDarkRoom, setIsBeforeZooming, setIsTransitioning } =
    useToggleRoomStore();

  const cameraPositions = {
    dark: {
      position: [
        -5.1 * 1.5,
        4.2 * 1.5,
        5.4 * 1.5,
      ],
    },
    light: {
      position: [3.2, 16.2, 21.6],
    },
  };


  

  const zoomValues = {
    default: isMobile ? 74 : 135,
    animation: isMobile ? 65 : 110,
  };


  useEffect(() => {
    if (!cameraRef.current) return;

    const targetPosition = isDarkRoom
      ? cameraPositions.dark.position
      : cameraPositions.light.position;

    gsap.set(cameraRef.current.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
    });
  }, [isExperienceReady]);

  useEffect(() => {
    if (!cameraRef.current) return;

    zoomValues.default = isMobile ? 74 : 135;
    zoomValues.animation = isMobile ? 65 : 110;

    cameraRef.current.zoom = zoomValues.default;
    cameraRef.current.updateProjectionMatrix();
  }, [isMobile]);

  useEffect(() => {
    if (!cameraRef.current) return;

    const targetPosition = isDarkRoom
      ? cameraPositions.dark.position
      : cameraPositions.light.position;

    const t1 = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
      },
    });
    t1.to(cameraRef.current, {
      zoom: zoomValues.animation,
      duration: 1,
      ease: "power3.out",
      onStart: () => {
        setIsTransitioning(true);
        setIsBeforeZooming(true);
      },
      onUpdate: () => {
        cameraRef.current.updateProjectionMatrix();
      },
    })
      .to(cameraRef.current.position, {
        x: targetPosition[0],
        y: targetPosition[1],
        z: targetPosition[2],
        duration: 1.5,
        ease: "power3.out",
      })
      .to(cameraRef.current, {
        zoom: zoomValues.default,
        duration: 1,
        ease: "power3.out",
        onStart: () => {
          setIsBeforeZooming(false);
        },
        onUpdate: () => {
          cameraRef.current.updateProjectionMatrix();
        },
      });
  }, [isDarkRoom]);

  useEffect(() => {
    const onPointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      pointerRef.current = { x, y };
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 1) {
        pointerRef.current.x =
          (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointerRef.current.y =
          -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    // window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("touchmove", onTouchMove);

    return () => {
      // window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  });

  return (
    <>
      <Canvas style={{ position: "fixed", zIndex: 1, top: 0, left: 0 }} shadows>
        <Environment files="/models/Light Room/rostock_laage_airport_1k.hdr" 
          background={true} 
          environmentIntensity={0.01}/>
        
        
        <OrthographicCamera
          ref={cameraRef}
          makeDefault
          position={cameraPositions.dark.position}
          rotation={[
            -0.6, -0.7, -0.4,
          ]}
          zoom={zoomValues.default}
        />
        
        <OrbitControls/>
        <Scene
          camera={cameraRef}
          pointerRef={pointerRef}
          isExperienceReady={isExperienceReady}
        />

          {/* <BoxWithDecal/> */}

        
        <LightGrid pos = {[-0.5, 8, 0.5]} intensity = {10}/>
      </Canvas>

      <div style={{ position: 'fixed', top: 50,  scale: isMB() ? 0.6 : 1,
           left: isMB() ? 20 : 20, color: 'black', zIndex:99 }}>
        
          
          <PanelFurnitures/>
          <ModifyControls/>
      </div>
    </>
  );
};

export default Experience;





function ModifyControls() 
{
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button style={{width:60,height:60, padding: 0}}>
        {/* <img src='https://www.svgrepo.com/show/510303/up-chevron.svg' style={imgStyle} alt="Camera Up" /> */}
      </button>
      
    </div>
  );
}


const isMB = () => {
  return window.innerWidth < 768;
}

const LightGrid = ({ pos, intensity }) => {
  const gridSize = 3;
  const step = 2;

  const spots = [];

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const p = [pos[0] + (i - (gridSize - 1) / 2) * step, pos[1], pos[2] + (j - (gridSize - 1) / 2) * step];
      
      spots.push(
        <>
        <mesh key={`mesh-${i}-${j}`} position={[p[0],p[1]+1,p[2]]}>
            <boxGeometry args={[0.10, 0.10, 0.10]} />
            <meshStandardMaterial color="white" />
          </mesh>
        <spotLight
          key={`${i}-${j}`}
          position={p}
          angle={Math.PI / 6}
          penumbra={1}
          intensity={intensity}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          target-position={[0, 0, 0]} // Lưu ý target cần được thêm vào scene riêng nếu khác mặc định
        />
        </>
      );
    }
  }

  return <>{spots}</>;
};
