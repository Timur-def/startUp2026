import { useState } from "react";
import { changeLogin, getUser } from "../../../auth";

export default function windowChangeLogin({ user, setUser }) {
  const [password, setPassword] = useState("");
  const [newLogin, setNewLogin] = useState("");
  const [isVisibliPassword, setIsVisibliPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChangeLogin = async () => {
    setError(null);
    if (!password && !newLogin) {
      return setError("Не введён пароль или логин!");
    }
    try {
      await changeLogin(user.login, newLogin, password);
      setUser(await getUser());
      setPassword("");
      setNewLogin("");
    } catch (err) {
      setError(err.message || "Введён неправильный пароль!");
    }
  };
  return (
    <div className="container blockChangePasssword">
      <p>Изменение логина</p>
      <input
        className="basicInput"
        placeholder="Введите пароль"
        type={isVisibliPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="basicInput"
        placeholder="Введите новый логин"
        type={"text"}
        value={newLogin}
        onChange={(e) => setNewLogin(e.target.value)}
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
      <button className="btn" onClick={handleChangeLogin}>
        Изменить логин
      </button>
    </div>
  );
}
