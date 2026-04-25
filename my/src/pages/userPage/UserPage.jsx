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


export default function UserPage({ setUserFuncInApp }) {
  const [allUsers, setAllUsers] = useState([]);
  const [isVisibliPassword_2, setIsVisibliPassword_2] = useState(false);
  const [user, setUser] = useState(getUser());
  const [windowNowOpen, setWindowNowOpen] = useState("signIn");
  useEffect(() => {
    getUsers().then((data) => setAllUsers(data));
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  useEffect(() => {
    if (user) {
      setUserFuncInApp(user);
    } else {
      setUserFuncInApp(null);
    }
  }, [user, setUserFuncInApp]);

  return (
    <div className="userPage">
      {user ? (
        <>
          <div className="block blockInfoUser">
            <div className="mainBlockInfo">
              <p className="textMainBlockInfo">
                {user.username}
                {user.role == "admin" && <span> - администратор</span>}
              </p>
              <button className="btn logout" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>
          <div className="block blockActionWithAccount">
            <WindowDeleteAccount user={user} />
            <WindowChangePasssword user={user} />
            <WindowChangeName user={user} setUser={setUser}/>
            <WindowChangeLogin user={user} setUser={setUser}/>
          </div>
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
