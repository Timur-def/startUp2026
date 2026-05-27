import "./FullInfoProductPage.css";
// Добавляем useNavigate в импорт
import { Link, useLocation, useNavigate } from "react-router";
import { Canvas } from "@react-three/fiber";
import { Stage, OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
import * as THREE from "three";
import { addProductInCart, deleteProduct } from "../../auth";
import RedactModalWindow from "./RedactModalWindow";
import { useMessage } from "../../components/message/useMessage";

function InteractiveHouse({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const modelRef = useRef();

  useEffect(() => {
    if (!modelRef.current) return;

    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
      const scale = 2.5 / maxDim;
      modelRef.current.scale.setScalar(scale);
      modelRef.current.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale,
      );
    }
  }, [clonedScene]);

  useEffect(() => {
    return () => {
      clonedScene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      useGLTF.clear(modelPath);
    };
  }, [clonedScene, modelPath]);

  return <primitive ref={modelRef} object={clonedScene} />;
}

export default function FullInfoProductPage({ setUserFuncInApp }) {
  const location = useLocation();
  const navigate = useNavigate(); // Инициализируем навигацию
  const [isModalWindow, setIsModalWindow] = useState(false);
  const [error, setError] = useState(null);
  const { triggerMessage, renderMessage } = useMessage();

  const product = location.state.item
    ? location.state.item
    : location.state.data;
  const productInfoShopman = location.state.item?.shopmanInfo
    ? location.state.item.shopmanInfo
    : location.state.data.shopmanInfo;
  const user = location.state?.user;

  const handleDeleteProduct = async () => {
    if (window.confirm("Удалить этот товар?")) {
      try {
        await deleteProduct({ id: product._id });
        navigate("/productList", {
          state: { deletedId: product._id },
          replace: true,
        });
      } catch (error) {
        console.error("Ошибка при удалении:", error);
        triggerMessage("Ошибка сервера", true);
      }
    }
  };

  const handleAddToCart = async () => {
    if (user) {
      const result = await addProductInCart(product._id, user._id);
      console.log(result.updatedUser);
      if (result) {
        triggerMessage("Товар добавлен в корзину", false);
      } else {
        triggerMessage(`Не удалось добавить`, true);
      }
    } else {
      triggerMessage("Ввойдите в аккаунт, чтобы добавлять товары в корзину");
      return;
    }
  };

  if (!product) return <div>Товар не найден</div>;

  return (
    <div className="fullInfoProductPage">
      <div className="infoBlock">
        <div className="mainBlockText">
          <div className="greenBlock" />
          <div className="texts">
            <p className="titleProduct">{product.title}</p>
            <p className="priceProduct">{product.price} ₽</p>
          </div>
        </div>
        <div className="downBlock">
          <div className="descriptionBlock">
            <p className="descriptionTitle">О предложении: </p>
            <p className="descriptionText">{product.description}</p>
          </div>
          <div className="contactInformationBlock">
            <p className="descriptionTitle">Контактная информация продавца: </p>
            <p className="descriptionText">
              Имя продавца: {productInfoShopman.username}
            </p>
            <p className="descriptionText">
              Логин продавца: {productInfoShopman.login}
            </p>
            <p className="descriptionText adress">
              Адрес дома: {product.addressHome}
            </p>
          </div>
          <div className="btnsBlock">
            {user?.role !== "admin" &&
              !user?.saleProductArray?.includes(product.id) && (
                <>
                  <div className="btn btnBuy">Приобрести</div>
                  <div className="btn btnBuy" onClick={handleAddToCart}>
                    Добавить в корзину
                  </div>
                </>
              )}
            {user?.role === "admin" && (
              <>
                <div
                  className="btn btnRedact"
                  onClick={() => setIsModalWindow(true)}
                >
                  Редактировать товар
                </div>
                <div className="btn btnDelete" onClick={handleDeleteProduct}>
                  Удалить товар
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="windowHouse">
        {renderMessage()}
        {location.state.item ? (
          <Link className="btn backBtn" to={"/userPage"}>
            Вернуться в профиль
          </Link>
        ) : (
          <Link className="btn backBtn" to={"/productList"}>
            Вернуться к товарам
          </Link>
        )}

        <Canvas camera={{ position: [0, 0, 5] }}>
          <Suspense fallback={null}>
            <InteractiveHouse modelPath={product.modelPath} />
            <Environment preset="city" />
            <OrbitControls
              minDistance={2}
              maxDistance={5}
              maxPolarAngle={Math.PI / 2}
              makeDefault
            />
          </Suspense>
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} />
        </Canvas>
      </div>
      {isModalWindow && (
        <RedactModalWindow
          setIsModalWindow={setIsModalWindow}
          product={product}
        />
      )}
    </div>
  );
}
