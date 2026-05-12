import "./ProductList.css";
import CardProduct from ".//cardProduct/CardProduct";
import { getProducts, addProduct, deleteProduct } from "../../auth";
import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useLocation, useNavigate } from "react-router";
import ModalWindow from "./ModalWindow";
import { useMessage } from "../../components/message/useMessage";

export default function ProductList({ user }) {
  const [allProducts, setAllProducts] = useState([]);
  const [startIndex, setStartIndex] = useState(() => {
    return parseInt(localStorage.getItem("products_index") || "0");
  });
  const location = useLocation();
  const visibleProducts = allProducts.slice(startIndex, startIndex + 4);
  const [isModalWindow, setIsModalWindow] = useState(false);
  const scrollRef = useRef();
  const [error, setError] = useState("");
  const { triggerMessage, renderMessage } = useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    getProducts().then((data) => {
      setAllProducts(data);
      const savedIndex = parseInt(
        localStorage.getItem("products_index") || "0",
      );
      if (savedIndex >= data.length) {
        setStartIndex(0);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("products_index", startIndex);
  }, [startIndex]);

  useEffect(() => {
    const deletedId = location.state?.deletedId;
    const isRedact = location.state?.isRedact;

    if (deletedId) {
      setAllProducts((prev) => prev.filter((p) => p._id !== deletedId));
      triggerMessage("Товар удалён", false);
      navigate(location.pathname, { replace: true, state: {} });
    }else if (isRedact) {
      triggerMessage("Товар изменён", false);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.deletedId, triggerMessage, navigate, location.pathname]);

  const changeStartIndex = (side) => {
    if (side === "next" && startIndex + 4 < allProducts.length) {
      setStartIndex((prev) => prev + 4);
    }
    if (side === "back" && startIndex - 4 >= 0) {
      setStartIndex((prev) => prev - 4);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Удалить этот товар?")) {
      await deleteProduct({ id });
      getProducts().then((data) => {
        setAllProducts(data);
        const savedIndex = parseInt(
          localStorage.getItem("products_index") || "0",
        );
        if (savedIndex >= data.length) {
          setStartIndex((prev) => prev - 4);
        }
      });
      triggerMessage(error ? error : "Товар удалён", !!error);
    }
  };

  const handleAddProduct = async (product, file) => {
    setError(null);
    if (
      product.title &&
      product.description &&
      product.price &&
      file &&
      product.shopmanInfo &&
      product.addressHome
    ) {
      await addProduct(product, file);
      const data = await getProducts();
      setAllProducts(data);
      setIsModalWindow(false);
      if (data.length > startIndex + 4) {
        setStartIndex((prev) => prev + 4);
      }
    } else {
      setError("Введены не все данные");
    }
    triggerMessage(error ? error : "Товар добавлен", !!error);
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
            handleAddProduct={handleAddProduct}
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
          {visibleProducts.map((dataProduct) => {
            return (
              <CardProduct
                key={dataProduct._id}
                user={user}
                data={dataProduct}
                handleDeleteProduct={handleDeleteProduct}
              />
            );
          })}
        </div>
      </div>
      {renderMessage()}
    </div>
  );
}
