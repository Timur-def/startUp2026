import "./ProductList.css";
import CardProduct from ".//cardProduct/CardProduct";
import { getProducts, addProduct } from "../../auth";
import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useLocation } from "react-router";

import ModalWindow from "./ModalWindow";


export default function ProductList({ user }) {
  const [allProducts, setAllProducts] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const location = useLocation();
  const visibleProducts = allProducts.slice(startIndex, startIndex + 4);
  const [isModalWindow, setIsModalWindow] = useState(false);
  const scrollRef = useRef();

  // 1. Первичная загрузка
  useEffect(() => {
    getProducts().then((data) => setAllProducts(data));
  }, []);

  // 2. Слушатель удаления через навигацию (возврат с FullInfoPage)
  useEffect(() => {
    if (location.state?.deletedId) {
      const idToRemove = location.state.deletedId;
      setAllProducts((prev) => prev.filter((p) => p._id !== idToRemove));

      // Очищаем стейт истории, чтобы не срабатывало при обновлении страницы
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 3. Функция удаления для использования внутри списка
  const handleDeleteFromList = (id) => {
    setAllProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const changeStartIndex = (side) => {
    if (side === "next" && startIndex + 4 < allProducts.length) {
      setStartIndex((prev) => prev + 4);
    }
    if (side === "back" && startIndex - 4 >= 0) {
      setStartIndex((prev) => prev - 4);
    }
  };

  return (
    <div ref={scrollRef} className="productListContainer">
      <Canvas
        key="main-canvas"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 2,
        }}
        eventPrefix="client"
      >
        <View.Port />
      </Canvas>

      <div className="contentLayer">
        {user?.role === "admin" && (
          <div
            className="btn addProductButton"
            onClick={() => setIsModalWindow(true)}
          >
            +
          </div>
        )}

        {isModalWindow && (
          <ModalWindow
            setIsModalWindow={setIsModalWindow}
            setAllProducts={setAllProducts}
          />
        )}

        {startIndex !== 0 && (
          <div
            className="btn btnChangeSide leftBtn"
            onClick={() => changeStartIndex("back")}
          >
            {"<"}
          </div>
        )}
        {startIndex + 4 < allProducts.length && (
          <div
            className="btn btnChangeSide rightBtn"
            onClick={() => changeStartIndex("next")}
          >
            {">"}
          </div>
        )}

        <div className="productList">
          {visibleProducts.map((dataProduct) => (
            <CardProduct
              key={dataProduct._id}
              user={user}
              data={dataProduct}
              onDelete={handleDeleteFromList}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
