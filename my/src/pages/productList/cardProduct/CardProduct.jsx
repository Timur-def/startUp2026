import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { View, OrbitControls, useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { Link } from "react-router";
import * as THREE from "three";
import "./CardProduct.css";

function StaticHouse({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const { scale, position } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 2.5 / maxDim : 1;
    return {
      scale: s,
      position: [-center.x * s, -center.y * s, -center.z * s],
    };
  }, [clonedScene]);

  return <primitive object={clonedScene} scale={scale} position={position} rotation={[0, Math.PI * -2, 0]} />;
}

function SceneContent({ modelPath }) {
  return (
    <>
      <perspectiveCamera makeDefault position={[0, 1, 4]} fov={85} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <Suspense fallback={null}><StaticHouse modelPath={modelPath} /></Suspense>
      <OrbitControls makeDefault enableZoom={false} enableRotate={false} enablePan={false} target={[0, 0, 0]} />
    </>
  );
}

export default function CardProduct({ data, user, handleDeleteProduct }) {
  const { title, price, modelPath } = data;
  const viewRef = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: "100px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);



  return (
    <div className="cardProduct">
      <Link to={"/fullInfoProductPage"} state={{ data, user }} className="windowProduct" ref={viewRef}>
        {isVisible && (
          <View track={viewRef} style={{ width: "100%", height: "100%" }}>
            <SceneContent modelPath={modelPath} />
          </View>
        )}
      </Link>
      <div className="textBlock">
        <p className="titleCardProduct">{title}</p>
        <p className="priceCardProduct">{price} ₽</p>
      </div>
      <Link to={"/fullInfoProductPage"} state={{ data, user }} className="btnWatchProduct">
        <p style={{ color: "black" }}>Узнать подробности</p>
      </Link>
      {user?.role === "admin" && (
        <button className="btnDeleteProduct" onClick={() => handleDeleteProduct(data._id)}>🗑️</button>
      )}
    </div>
  );
}
