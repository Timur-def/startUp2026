import "./App.css";

import UserPage from "./pages/userPage/UserPage";
import ProductList from "./pages/productList/ProductList";
import FullInfoProductPage from "./pages/fullInfoProductPage/FullInfoProductPage";
import HelpBlog from "./pages/helpBlog/HelpBlog";
import { Link, Route, Routes } from "react-router";
import { useState } from "react";
import { getUser } from "./auth";
import MainPage from "./pages/mainPage/MainPage";

export default function App() {
  const [user, setUser] = useState(getUser());


  return (
        <div className="mainWindow">
          <div className="header">
              <div className="blockLink">
                <Link className="link" to={"/"}>
                  Главная
                </Link>
                <Link className="link" to={"/productList"}>
                  Предложения
                </Link>
              </div>
              <div className="blockLogo">
                <h1 className="blockLogo__title">Домашний гид</h1>
                <p className="blockLogo__p">Место поиска уютного дома</p>
              </div>
              <div className="blockLink">
                <Link className="link" to={"/helpBlog"}>
                  Справочный блог
                </Link>
                <Link className="link" to={"/userPage"}>
                  Профиль
                </Link>
            </div>
          </div>
          <div className="windowPages">
            <Routes>
              <Route
                path="/productList"
                element={<ProductList user={user} />}
              />
              <Route path="/userPage" element={<UserPage setUserFuncInApp={setUser}/>} />
              <Route path="/" element={<MainPage />} />
              <Route path="/fullInfoProductPage" element={<FullInfoProductPage />} />
              <Route
                path="/helpBlog"
                element={<HelpBlog user={user}/>}
              />
            </Routes>
          </div>
        </div>
  );
}
