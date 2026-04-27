import { useState } from "react";
import { register, login } from "../../auth";
import "./SignUp.css";

export default function SignUp({ onLogin }) {
  const [name, setName] = useState("");
  const [userlogin, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isVisibliPassword, setIsVisibliPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !password || !userlogin) {
      return setError("Не заполнено какое-то из полей");
    }

    if (password.split("").length < 8) {
      return setError("Пароль должен содержать больше 8 символов");
    }
    const passwordRegex = /^(?=.*[a-zA-Zа-яёА-ЯЁ])(?=.*\d).+$/;
    const isValid = passwordRegex.test(password);
    if (!isValid) {
      return setError(
        "Пароль должен содержать хотя бы одну цифру и буквы латинского или русского алфавитов",
      );
    }

    const data = await register(name, userlogin, password);
    if (!data.username) return setError("Ошибка в ведённых данных");
    if (data.username) {
      const loginData = await login(userlogin, password);
      if (loginData.user) onLogin(loginData.user);
    }
  };

  return (
    <div
      className="signUp"
      onKeyDown={(e) => e.key === "Enter" && handleRegister()}
    >
      <input
        type="text"
        placeholder="Введите своё имя"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Придумайте логин"
        onChange={(e) => setLogin(e.target.value)}
      />
      <input
        type={isVisibliPassword ? "text" : "password"}
        placeholder="Придумайте пароль"
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="checkboxInput">
        <input
          type="checkbox"
          checked={isVisibliPassword}
          onChange={() => setIsVisibliPassword(!isVisibliPassword)}
        />
        <div onClick={() => setIsVisibliPassword(!isVisibliPassword)}>
          Показать пароль
        </div>
      </div>
      {error && <p className="errorText">{error}</p>}
      <button className="btn" onClick={handleRegister}>
        Зарегистрироваться
      </button>
    </div>
  );
}
