import "./UserPage.css";
import {
  logout,
  deleteUser,
  getUser,
  getUsers,
  changePassword,
} from "../../auth";
import { useState, useEffect } from "react";
import SignIn from "../signIn/SignIn";
import SignUp from "../signUp/SignUp";
import WindowDeleteAccount from "./windowsActionWithAccount/windowDeleteAccount";
import WindowChangePasssword from "./windowsActionWithAccount/windowChangePasssword";
import WindowChangeName from "./windowsActionWithAccount/windowChangeName";
import WindowChangeLogin from "./windowsActionWithAccount/windowChangeLogin";
import WindowSelectedUser from "./windowSelectedUser";
import CustomSelect from "../../components/customSelect/CustomSelect";

export default function UserPage({ setUserFuncInApp }) {
  const [windowNowOpen, setWindowNowOpen] = useState("signIn");
  const [allUsers, setAllUsers] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [shareUserInput, setShareUserInput] = useState("");
  const viewArrayUsers = shareUserInput !== "" ? sharedUsers : allUsers;
  const [isVisibliPassword_2, setIsVisibliPassword_2] = useState(false);
  const [user, setUser] = useState(getUser());
  const [selectedUser, setSelectedUser] = useState({});
  const [isModalWindowSelectedUser, setIsModalWindowSelectedUser] =
    useState(false);
  const array = [
    { title: "Найти по имени", value: "name" },
    { title: "Найти по логину", value: "login" },
    { title: "Найти по роли", value: "role" },
  ];
  const [selectedOptionInArr, setSelectedOptionInArr] = useState(array[0]);

  const handleSelectChange = (value) => {
    setSelectedOptionInArr(value);
  };

  useEffect(() => {
    getUsers().then((data) => setAllUsers(data));
  }, []);

  const handleLogout = () => {
    if (window.confirm("Выйти из аккаунта?")) {
      logout();
      setUser(null);
    }
  };

  useEffect(() => {
    if (user) {
      setUserFuncInApp(user);
    } else {
      setUserFuncInApp(null);
    }
  }, [user, setUserFuncInApp]);

  useEffect(() => {
    if (selectedOptionInArr.value == "name") {
      if (shareUserInput.trim() === "") {
        setSharedUsers([]);
        return;
      }
      const filtred = allUsers.filter((u) => {
        return (
          u.username.toLowerCase().includes(shareUserInput.toLowerCase()) &&
          u._id !== user._id
        );
      });

      setSharedUsers(filtred);
    }
    if (selectedOptionInArr.value == "login") {
      if (shareUserInput.trim() === "") {
        setSharedUsers([]);
        return;
      }
      const filtred = allUsers.filter((u) => {
        return (
          u.login.toLowerCase().includes(shareUserInput.toLowerCase()) &&
          u._id !== user._id
        );
      });

      setSharedUsers(filtred);
    }
    if (selectedOptionInArr.value == "role") {
      if (shareUserInput.trim() === "") {
        setSharedUsers([]);
        return;
      }
      const filtred = allUsers.filter((u) => {
        return (
          u.role.toLowerCase().includes(shareUserInput.toLowerCase()) &&
          u._id !== user._id
        );
      });

      setSharedUsers(filtred);
    }
  }, [shareUserInput, allUsers]);

  return (
    <div className="userPage">
      {user ? (
        <>
          <div className="block blockInfoUser">
            <div className="mainBlockInfo">
              <div className="textMainBlockInfo">
                <div className="defInfo">
                  {user.username}
                  <p className="loginSpan">@{user.login}</p>
                </div>
                {user.role == "admin" && (
                  <span className="adminSpan"> - администратор</span>
                )}
              </div>
              <button className="btn logout" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>
          <div className="block blockActionWithAccount">
            <WindowDeleteAccount user={user} setUser={setUser} />
            <WindowChangePasssword user={user} setUser={setUser} />
            <WindowChangeName user={user} setUser={setUser} />
            <WindowChangeLogin user={user} setUser={setUser} />
          </div>
          {user.role == "admin" && (
            <div className="block blockActionWithUsers">
              {viewArrayUsers.length > 0
                ? viewArrayUsers.map((userData) => {
                    return (
                      user._id !== userData._id && (
                        <div
                          className="cardUser"
                          onClick={() => (
                            setIsModalWindowSelectedUser(true),
                            setSelectedUser(userData)
                          )}
                          key={userData._id}
                        >
                          <p>Имя: {userData.username}</p>
                          <p>Логин: {userData.login}</p>
                          <p>Роль - "{userData.role}"</p>
                        </div>
                      )
                    );
                  })
                : "Пользователей не найдено"}
              <div className="inputsShare">
                <CustomSelect array={array} onChange={handleSelectChange} />
                <input
                  type="text"
                  className="inputShare"
                  placeholder={selectedOptionInArr.title}
                  value={shareUserInput}
                  onChange={(e) => setShareUserInput(e.target.value)}
                />
              </div>
            </div>
          )}
          {isModalWindowSelectedUser && (
            <WindowSelectedUser
              setIsModalWindowSelectedUser={setIsModalWindowSelectedUser}
              user={selectedUser}
              setAllUsers={setAllUsers}
            />
          )}
        </>
      ) : (
        <div className="userPage" style={{ justifyContent: "center" }}>
          {windowNowOpen == "signIn" ? (
            <div className="windowAuth">
              <SignIn onLogin={setUser} />
              <p
                className="textChangeWindowAuth"
                onClick={() => setWindowNowOpen("signUp")}
              >
                Ещё нет аккаунта? Создайте прямо сейчас
              </p>
            </div>
          ) : (
            <div className="windowAuth">
              <SignUp onLogin={setUser} />
              <p
                className="textChangeWindowAuth"
                onClick={() => setWindowNowOpen("signIn")}
              >
                Уже есть аккаунт? Войдите в него прямо сейчас
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
