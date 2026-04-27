import { useState } from "react";
import { deleteUser } from "../../../auth";

export default function windowDeleteAccount({ user, setUser }) {
  const [password, setPassword] = useState("");

  const [isVisibliPassword, setIsVisibliPassword] = useState(false);
  const [error, setError] = useState(null);
  const handleDelete = async () => {
    setError(null);
    if (!password) {
      return setError("Не введён пароль!");
    }
    try {
      await deleteUser(user.login, password);
      setUser(null);
    } catch (err) {
      setError(err.message || "Введён неправильный пароль!");
    }
  };
  return (
    <div className="container blockDeleteAccount">
      <p>Удаление аккаунта</p>
      <input
        className="basicInput"
        placeholder="Введите пароль"
        type={isVisibliPassword ? "text" : "password"}
        value={password}
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
      <button className="btn btnBlockActionWithAccount" onClick={handleDelete}>
        Удалить аккаунт
      </button>
    </div>
  );
}
