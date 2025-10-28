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
import { useThree } from "@react-three/fiber";
import PanelFurnitures from "./PanelFurnitures";
import html2canvas from 'html2canvas';

const Experience = () => {
  const cameraRef = useRef();
  const pointerRef = useRef({ x: 0, y: 0 });
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const { isExperienceReady } = useExperienceStore();
  const {setMessage} =  useSelection();
  const { isMobile } = useResponsiveStore();
  const [capture, setCapture] = useState(false);

  const { isDarkRoom, setIsBeforeZooming, setIsTransitioning } =
    useToggleRoomStore();

  const cameraPositions = {
    dark: {
      position: [
        -7.65,
        6.3,
        8.1,
      ],
    },
    light: {
      position: [3.2, 16.2, 21.6],
    },
  };


  

  const zoomValues = {
    default: isMobile ? 74 : 80,
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

  // useEffect(()=>{
  //   setMessage(`${cameraPositions.dark.position}`);
  // },[cameraPositions.dark.position]);

  return (
    <>
      <Canvas style={{ position: "fixed", zIndex: 1, top: 0, left: 0 }} shadows gl={{ preserveDrawingBuffer: true }}>
        <Environment files="/models/Light Room/rostock_laage_airport_1k.hdr" 
          background={false} 
          environmentIntensity={1}/>
        
        
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

        
        {/* <LightGrid pos = {[-0.5, 8, 0.5]} intensity = {10}/> */}
        <SaveScreenshotButton capture={capture} setCapture={setCapture}/>
      </Canvas>

      <div style={{ position: 'fixed', top: 20,  scale: isMB() ? 0.6 : 1,
           left: isMB() ? 20 : 20, color: 'black', zIndex:99 }}>
            <img src="/images/logo-fureal2-1.png" style={{width:150,left:-20,position:'relative'}} alt="Logo" />
          
          <PanelFurnitures/>
      </div>
      <div style={{ position: 'fixed', left: 200,  bottom: 50,
           color: 'black', zIndex:99 }}>
          <ModifyControls setCapture={setCapture}/>
      </div>
    </>
  );
};

export default Experience;
const btnStyle = { width: 60, height: 60, padding: 0, borderRadius:10, border: '1px solid #777' };

import { usePointer, useSelection } from "../stores/selectionStore";

import { Html } from '@react-three/drei';

function SaveScreenshotButton({capture, setCapture}) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if(capture)
    {
      handleSave();
      setCapture(false);
    }
  },[capture]);

  const handleSave = () => {
    gl.render(scene, camera);
    const imgData = gl.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'screenshot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <></>
  );
}

const imgStyle = { width: 30, height: 30 };

function ModifyControls({setCapture}) {
  
  const { rotateLeft, rotateRight,getResult } = usePointer();
  const {setCurrentLibNodeSelection, currentSelection, message,setMessage } = useSelection();
//   useEffect(() => {
//   console.log("Rotation or Pointer changed", pointer, rotationIndex);
// }, [pointer, rotationIndex]);


  const rotateCW = () => {
    // setRotationIndex((prev) => (prev + 1) % 4);
    // console.log("Rotation",pointer, rotationIndex);
    rotateLeft(currentSelection);
    setMessage(getResult());
  };

  const rotateCCW = () => {
    // setRotationIndex((prev) => (prev + 3) % 4); // -1 mod 4
    // console.log("Rotation",pointer, rotationIndex);
    rotateRight(currentSelection);
    setMessage(getResult());
  };

  const handleSelectMode = () => {
    setCurrentLibNodeSelection(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <FiveOptionToggle/>
        <div style={{width:500, marginRight:50}}>
          {message && message.split('|').map((el)=> <p style={{fontSize:12, lineHeight:'1.2rem'}}>
            {el}
          </p>)}
        </div>
      </div>
      <button style={btnStyle} onClick={handleSelectMode}>
        <img src="/images/select.png" style={imgStyle} alt="Rotation" />
        Chọn
      </button>

      <button style={btnStyle} onClick={rotateCW}>
        <img src="/images/rotation-icon-left.png" style={imgStyle} alt="Rotation" />
        Xoay 90
      </button>

      <button style={btnStyle} onClick={rotateCCW}>
        <img src="/images/rotation-icon.png" style={imgStyle} alt="Rotation-Left" />
        Xoay 90
      </button>

      <button style={btnStyle} onClick={() => setCapture(true)}>
        <img src="/images/save.png" style={imgStyle} alt="Save"/><br/>
        Lưu
      </button>


      <SimpleSlider/>
    </div>
  );
}


// import React, { useRef } from "react";
// import { Canvas, useThree } from "@react-three/fiber";


export function SimpleSlider() {
  const {directionAxis, setDirectionAxis, getResult, personAge, setPersonAge} = usePointer();
  const {setMessage} = useSelection();
  const [value, setValue] = useState(directionAxis);

  const handleChange = (event) => {
    setValue(parseInt(event.target.value));
  };

  useEffect(()=>{
    setDirectionAxis(value);
  },[value]);

  useEffect(()=>{
    setMessage(getResult());
  },[directionAxis]);


  return (
    <div style={{ width: 200, margin: 20 }}>
      <input
        type="range"
        min="1"
        max="360"
        value={value}
        onChange={handleChange}
        style={{ width: "100%" }}
      />
      <div style={{ textAlign: "center", marginTop: 10 }}>
        Hướng phòng: {value}°
      </div>
    </div>
  );
}

const isMB = () => {
  return window.innerWidth < 768;
}

const colors = [
  { label: "Kim", color: "#d4af37" },    // Vàng kim
  { label: "Mộc", color: "#228B22" },    // Xanh cây
  { label: "Thủy", color: "#1E90FF" },   // Xanh nước
  { label: "Hỏa", color: "#FF4500" },    // Đỏ lửa
  { label: "Thổ", color: "#8B4513" }     // Nâu đất
];

import rules from "./rules.json";

export function FiveOptionToggle() {
  const {setMessage} = useSelection();
  const [selected, setSelected] = useState("Kim");
  const {directionAxis, setDirectionAxis, getResult, personAge, setPersonAge} = usePointer();

  useEffect(()=>{
    if(!rules || !rules[selected]) return;
    setMessage(getResult());
  },[selected, personAge]);

  const handleClick = (label) => {
    setSelected(label);
    setPersonAge(label);
  }

  const handleResultClick = () => {
    setMessage(getResult());
  }

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <button
          
          onClick={() => handleResultClick()}
          style={{
            width:120,
            padding: "10px 0px",
            borderRadius: "5px",
            border: "1px solid gray",
            backgroundColor: "#f0f0f0",
            color: "black",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.3s"
          }}
        >
      Mệnh gia chủ
      </button>

      {colors.map(({ label, color }) => (
        <button
          key={label}
          onClick={() => handleClick(label)}
          style={{
            width:50,
            padding: "10px 0px",
            borderRadius: "5px",
            border: selected === label ? `3px solid ${color}` : "1px solid gray",
            backgroundColor: selected === label ? color : "#f0f0f0",
            color: selected === label ? "white" : "black",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.3s"
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
