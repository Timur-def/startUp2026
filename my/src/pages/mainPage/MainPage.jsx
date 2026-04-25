import { Link } from "react-router";
import "./MainPage.css";
import { useState, useEffect } from "react";

export default function MainPage() {
  const [width, setWidth] = useState(window.innerWidth);

  function useWindowWidth() {
    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return width;
  }
  useWindowWidth()

  return (
    <div className="mainPage">
      <div className="blocks upLeftBlock">
        <p className="firstPInBlock">
          Вас приветствует <span className="spanInUpBlock">Домашний гид</span>!
        </p>
        <p className="secondPInBlock">
          Здесь вы сможете обрести тёплый домашний очаг для себя или близких. А также отдать своё уютное гнёздышко кому-то в добрые руки :)
        </p>
        <Link className="btn" to={"/productList"}>
          Перейти к предложениям
        </Link>
      </div>
      {width >= 750 && (
        <div className="blocks downRightBlock">
          <p className="titleBlock">Контактная информация:</p>
          <p className="p">
            Телефон: <span>+381 624193667</span>
          </p>
          <p className="p">
            Почта: <span>home_guide@google.com</span>
          </p>
          <p className="p">
            Адрес офиса: <span>Сербия, Белград, Батајнички Друм, 1А</span>
          </p>
          <p className="p">
            Время открытых дверей в офисе: <span>12:00 - 18:00 ежедневно</span>
          </p>
          <p className="footnote">
            не является официальной информацией (приведена для примера)
          </p>
        </div>
      )}
    </div>
  );
}
