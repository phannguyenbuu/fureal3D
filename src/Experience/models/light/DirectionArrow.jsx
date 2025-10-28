import React, { useRef } from "react";
import * as THREE from "three";
import { useGLTF, useVideoTexture } from "@react-three/drei";
import { convertMaterialsToBasic } from "../../utils/convertToBasic";

export default function Model(props) {
  const { nodes, materials } = useGLTF("/models/Light Room/obj/direction.glb");
  const grayMaterial = new THREE.MeshStandardMaterial({ color: 'gray' });

  return (
    <group {...props} dispose={null}>
      {Object.values(nodes).map(
          (node, index) =>
            node.geometry && (
              <mesh
                key={index}
                geometry={node.geometry}
                material={grayMaterial}
                position={node.position}
                rotation={node.rotation}
                scale={[1,1,1]}
              />
            )
        )}
    </group>
  );
}

// useGLTF.preload("/models/Light Room/Light_First.glb");
