import { useState } from "react";
import { login } from "../../auth";
import "./SignIn.css";

export default function SignIn({ onLogin }) {
  const [userlogin, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isVisibliPassword, setIsVisibliPassword] = useState(false);
  const handleLogin = async () => {
    setError(null);
    const data = await login(userlogin, password);
    if (data.message) return setError("Ошибка в ведённых данных");
    if (data.user) onLogin(data.user);
  };

  return (
    <div
      className="signIn"
      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
    >
      <input
        type="text"
        placeholder="Введите логин"
        onChange={(e) => setLogin(e.target.value)}
      />
      <input
        type={isVisibliPassword ? "text" : "password"}
        placeholder="Введите пароль"
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

      <button className="btn" onClick={handleLogin}>
        Войти
      </button>
    </div>
  );
}
