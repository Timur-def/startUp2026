import { useState } from "react";
import { createPortal } from "react-dom";
import { editProduct, getProducts } from "../../auth";
import { useNavigate } from "react-router"; // Добавили навигацию

export default function RedactModalWindow({ setIsModalWindow, product }) {
  const navigate = useNavigate(); // Инициализируем
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(product);

  const handleAddProduct = async () => {
    setError(null);
    if (
      productData.title ||
      productData.description ||
      productData.price ||
      file ||
      productData.shopmanInfo.addressHome ||
      productData.shopmanInfo.name ||
      productData.shopmanInfo.phoneNumber
    ) {
      if (
        productData.title !== product.title ||
        productData.description !== product.description ||
        productData.price !== product.price ||
        productData.shopmanInfo.addressHome !==
          product.shopmanInfo.addressHome ||
        productData.shopmanInfo.name !== product.shopmanInfo.name ||
        productData.shopmanInfo.phoneNumber !== product.shopmanInfo.phoneNumber
      ) {
        try {
          await editProduct(productData._id, productData, file);
          setIsModalWindow(false);
          navigate("/productList");
        } catch (err) {
          setError("Ошибка при сохранении данных");
        }
      } else {
        setError("Не изменено ни одно поле");
      }
    } else {
      setError("Не заполнено ни одно поле");
    }
  };

  return createPortal(
    <>
      <div className="modalWindow">
        <p className="titleInModalWindow">Редактирование товара: </p>
        <input
          className="textInput"
          type="text"
          placeholder="Название"
          value={productData.title}
          onChange={(e) =>
            setProductData({ ...productData, title: e.target.value })
          }
        />
        <textarea
          className="textInput bigInp"
          type="text"
          placeholder="Описание"
          value={productData.description}
          onChange={(e) =>
            setProductData({ ...productData, description: e.target.value })
          }
        />
        <input
          className="textInput"
          type="text"
          placeholder="Цена"
          value={productData.price}
          onChange={(e) =>
            setProductData({ ...productData, price: e.target.value })
          }
        />
        <div className="fileWrapper">
          <input
            className="fileInput"
            type="file"
            id="file-input"
            onChange={handleFileChange}
          />
          <label htmlFor="file-input" className="btn fileLabel">
            Выберите файл
          </label>
          <p>{file?.name || "Нет файла"}</p>
        </div>
        <p className="titleInModalWindow downTitle">Информация о продавце: </p>
        <input
          type="text"
          placeholder="Имя продавца"
          className="textInput"
          value={productData.shopmanInfo.name}
          onChange={(e) =>
            setProductData({
              ...productData,
              shopmanInfo: { ...productData.shopmanInfo, name: e.target.value },
            })
          }
        />
        <input
          type="text"
          placeholder="Телефон"
          className="textInput"
          value={productData.shopmanInfo.phoneNumber}
          onChange={(e) =>
            setProductData({
              ...productData,
              shopmanInfo: {
                ...productData.shopmanInfo,
                phoneNumber: e.target.value,
              },
            })
          }
        />
        <input
          type="text"
          placeholder="Адрес"
          className="textInput"
          value={productData.shopmanInfo.addressHome}
          onChange={(e) =>
            setProductData({
              ...productData,
              shopmanInfo: {
                ...productData.shopmanInfo,
                addressHome: e.target.value,
              },
            })
          }
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          className="btn addProductBtnInWindow"
          onClick={handleAddProduct}
        >
          Сохранить изменения
        </button>
      </div>
      <div className="background" onClick={() => setIsModalWindow(false)} />
    </>,
    document.body,
  );
}
