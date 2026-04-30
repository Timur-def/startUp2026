import { useState } from "react";
import { createPortal } from "react-dom";
import { addProduct, getProducts } from "../../auth";

export default function ModalWindow({
  setIsModalWindow,
  setAllProducts,
  setStartIndex,
  startIndex,
}) {
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState({
    title: "",
    description: "",
    price: "",
    shopmanInfo: { name: "", phoneNumber: "", addressHome: "" },
  });

  const handleAddProduct = async () => {
    setError(null);
    if (
      product.title &&
      product.description &&
      product.price &&
      file &&
      product.shopmanInfo.name &&
      product.shopmanInfo.phoneNumber &&
      product.shopmanInfo.addressHome
    ) {
      await addProduct(product, file);
      const data = await getProducts();
      setAllProducts(data);
      setFile(null);
      setIsModalWindow(false);
      if (data.length > startIndex + 4) {
        setStartIndex((prev) => prev + 4);
      }
    } else {
      setError("Введены не все данные");
    }
  };
  return createPortal(
    <>
      <div className="modalWindow">
        <p className="titleInModalWindow">Информация о товаре: </p>
        <input
          className="textInput"
          type="text"
          placeholder="Название"
          onChange={(e) => setProduct({ ...product, title: e.target.value })}
        />
        <textarea
          className="textInput bigInp"
          type="text"
          placeholder="Описание"
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
        />
        <input
          className="textInput"
          type="text"
          placeholder="Цена"
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
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
          onChange={(e) =>
            setProduct({
              ...product,
              shopmanInfo: {
                ...product.shopmanInfo,
                name: e.target.value,
              },
            })
          }
        />
        <input
          type="text"
          placeholder="Контактный номер телефона продавца"
          className="textInput"
          onChange={(e) =>
            setProduct({
              ...product,
              shopmanInfo: {
                ...product.shopmanInfo,
                phoneNumber: e.target.value,
              },
            })
          }
        />
        <input
          type="text"
          placeholder="Адрес дома"
          className="textInput"
          onChange={(e) =>
            setProduct({
              ...product,
              shopmanInfo: {
                ...product.shopmanInfo,
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
          Добавить
        </button>
      </div>
      <div className="background" onClick={() => setIsModalWindow(false)} />
    </>,
    document.body,
  );
}
