import { useState } from "react";
import { changeName, logout } from "../../../auth";

export default function windowChangeName({ user, setUser }) {
  const [password, setPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [isVisibliPassword, setIsVisibliPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChangeName = async () => {
    setError(null);
    if (!password && !newName) {
      return setError("Не введён пароль или имя!");
    }
    try {
      await changeName(user.login, newName, password);
      logout();
      setUser(null);
      setPassword("");
      setNewName("");
    } catch (err) {
      setError(err.message || "Введён неправильный пароль!");
    }
  };
  return (
    <div className="container blockChangePasssword">
      <p>Изменение имени</p>
      <input
        className="basicInput"
        placeholder="Введите пароль"
        type={isVisibliPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="basicInput"
        placeholder="Введите новое имя"
        type={"text"}
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
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
      <button className="btn" onClick={handleChangeName}>
        Изменить имя
      </button>
    </div>
  );
}
