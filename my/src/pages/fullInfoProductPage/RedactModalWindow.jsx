import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { editProduct, getProducts, getUsers } from "../../auth";
import { useNavigate } from "react-router";
import CustomSelect from "../../components/customSelect/CustomSelect";

export default function RedactModalWindow({ setIsModalWindow, product }) {
  const navigate = useNavigate();
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(product);

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
      productData.title ||
      productData.description ||
      productData.price ||
      file ||
      productData.addressHome ||
      productData.shopmanInfo
    ) {
      if (
        productData.title !== product.title ||
        productData.description !== product.description ||
        productData.price !== product.price ||
        productData.addressHome !== product.addressHome ||
        file !== product.file ||
        productData.shopmanInfo !== product.shopmanInfo
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
        <input
          type="text"
          placeholder="Адрес"
          className="textInput"
          value={productData.addressHome}
          onChange={(e) =>
            setProductData({
              ...productData,
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
              {productData.shopmanInfo?.username}
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
                          setProductData({ ...productData, shopmanInfo: item })
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
          Сохранить изменения
        </button>
      </div>
      <div className="background" onClick={() => setIsModalWindow(false)} />
    </>,
    document.body,
  );
}
