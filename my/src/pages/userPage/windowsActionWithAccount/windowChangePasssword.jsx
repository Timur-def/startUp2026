import { useState } from "react";
import { changePassword } from "../../../auth";

export default function windowChangePasssword({ user }) {
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [isVisibliPassword, setIsVisibliPassword] = useState(false);
  const [error, setError] = useState(null);
  
    const handleChangePassword = async () => {
    setError(null);
    if (!oldPassword && !newPassword) {
      return setError("Не введён пароль!");
    }
    try {
      await changePassword(user.login, oldPassword, newPassword);
      setNewPassword('')
      setOldPassword('')
    } catch (err) {
      setError(err.message || "Введён неправильный пароль!");
    }
  };
  return (
     <div className="container blockChangePasssword">
              <p>Изменение пароля</p>
              <input
                className="basicInput"
                placeholder="Введите пароль"
                type={isVisibliPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <input
                className="basicInput"
                placeholder="Введите новый пароль"
                type={isVisibliPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              <button
                className="btn"
                onClick={handleChangePassword}
              >
                Изменить пароль
              </button>
            </div>
  );
}


