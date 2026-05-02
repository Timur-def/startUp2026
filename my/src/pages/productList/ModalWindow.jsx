import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { addProduct, getProducts, getUsers } from "../../auth";
import CustomSelect from "../../components/customSelect/CustomSelect";
import "./ProductList.css";

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
    shopmanInfo: {},
    addressHome: "",
  });
  const [allUsers, setAllUsers] = useState([]);
  const array = [
    { title: "Найти по имени", value: "name" },
    { title: "Найти по логину", value: "login" },
  ];
  const [selectedOptionInArr, setSelectedOptionInArr] = useState(array[0]);
  const [shareUserInput, setShareUserInput] = useState("");
  const [sharedUsers, setSharedUsers] = useState([]);
  const viewArrayUsers = shareUserInput !== "" ? sharedUsers : allUsers;

  useEffect(() => {
    getUsers().then((data) => setAllUsers(data));
  }, []);

  useEffect(() => {
    if (selectedOptionInArr.value == "name") {
      if (shareUserInput.trim() === "") {
        setSharedUsers([]);
        return;
      }
      const filtred = allUsers.filter((u) => {
        return u.username.toLowerCase().includes(shareUserInput.toLowerCase());
      });

      setSharedUsers(filtred);
    }
    if (selectedOptionInArr.value == "login") {
      if (shareUserInput.trim() === "") {
        setSharedUsers([]);
        return;
      }
      const filtred = allUsers.filter((u) => {
        return u.login.toLowerCase().includes(shareUserInput.toLowerCase());
      });

      setSharedUsers(filtred);
    }
  }, [shareUserInput, allUsers]);

  const handleAddProduct = async () => {
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
        <input
          type="text"
          placeholder="Адрес дома"
          className="textInput"
          onChange={(e) =>
            setProduct({
              ...product,
              addressHome: e.target.value,
            })
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
        <div className="infoSelectUser">
          <div className="blockInfoSelectUser">
            <p className="titleInModalWindow downTitle">
              Информация о продавце:
            </p>
            <p className="titleAboutUser">
              {product.shopmanInfo?.username}
            </p>
          </div>
          <div className="infoSelectedSalesmanUserBlock">
            <div className="blockInfoSelectUser inputsShare">
              <CustomSelect
                className="select"
                array={array}
                onChange={setSelectedOptionInArr}
              />
              <input
                type="text"
                className="inputShare"
                placeholder={selectedOptionInArr.title}
                value={shareUserInput}
                onChange={(e) => setShareUserInput(e.target.value)}
              />
            </div>
          </div>
          <div className="allUsersBlock">
            {viewArrayUsers.length > 0
              ? viewArrayUsers.map((item) => {
                  return (
                    item.role == "salesman" && (
                      <div
                        className="cardUser"
                        key={item._id}
                        onClick={() =>
                          setProduct({ ...product, shopmanInfo: item })
                        }
                      >
                        <p>{item.username} </p>
                        <p className="loginSpan">@{item.login}</p>
                      </div>
                    )
                  );
                })
              : "Пользователей не найдено"}
          </div>
        </div>
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
