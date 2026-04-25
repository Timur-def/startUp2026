import { useState } from "react";
import { createPortal } from "react-dom";
import { editProduct, getProducts } from "../../auth";
import { useNavigate } from "react-router"; // Добавили навигацию

export default function RedactModalWindow({
  setIsModalWindow, productId
}) {
  const navigate = useNavigate(); // Инициализируем
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
    // Простая проверка на заполненность (можно расширить)
    if (product.title || product.price || file) {
      try {
        await editProduct(productId, product, file);
        setIsModalWindow(false);
        // После успешного редактирования перенаправляем на список
        // Там сработает useEffect и подтянет свежие данные
        navigate("/productList"); 
      } catch (err) {
        setError("Ошибка при сохранении данных");
      }
    } else {
      setError("Введены не все данные");
    }
  };

  return createPortal(
    <>
      <div className="windowAddButton">
        <p className="titleInModalWindow">Редактирование товара: </p>
        <input
          className="textInput"
          type="text"
          placeholder="Название"
          onChange={(e) => setProduct({ ...product, title: e.target.value })}
        />
        <input
          className="textInput"
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
              shopmanInfo: { ...product.shopmanInfo, name: e.target.value },
            })
          }
        />
        <input
          type="text"
          placeholder="Телефон"
          className="textInput"
          onChange={(e) =>
            setProduct({
              ...product,
              shopmanInfo: { ...product.shopmanInfo, phoneNumber: e.target.value },
            })
          }
        />
        <input
          type="text"
          placeholder="Адрес"
          className="textInput"
          onChange={(e) =>
            setProduct({
              ...product,
              shopmanInfo: { ...product.shopmanInfo, addressHome: e.target.value },
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
