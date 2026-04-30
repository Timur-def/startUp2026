import { useState } from "react";
import { changeRole, getUsers } from "../../auth";
import CustomSelect from "../../components/customSelect/CustomSelect";

export default function windowSelectedUser({
  user,
  setIsModalWindowSelectedUser,
  setAllUsers,
}) {
  const [error, setError] = useState(null);
  const array = [
    { title: "admin", value: "admin" },
    { title: "user", value: "user" },
  ];
  const [selectedOptionInArr, setSelectedOptionInArr] = useState(array[0]);

  const handleSelectChange = (value) => {
    setSelectedOptionInArr(value);
  };

  const handleChangeRole = async () => {
    setError(null);
    console.log(selectedOptionInArr.value, user.role);
    if (selectedOptionInArr.value == user.role) {
      return setError("Эта роль уже установлена у пользователя!");
    }
    if (user && window.confirm("Подтвердите смену роли")) {
      await changeRole(user.login, selectedOptionInArr.value);
      getUsers().then((data) => setAllUsers(data));
      setIsModalWindowSelectedUser(false);
    }
  };
  return (
    <>
      <div className="modalWindow">
        <p className="titleWindow">Информация о пользователе: </p>
        <p>Имя: {user.username}</p>
        <p>Логин: {user.login}</p>
        <p>Роль - "{user.role}"</p>
        <CustomSelect array={array} onChange={handleSelectChange} />
        {error && <p className="errorText">{error}</p>}
        <button onClick={handleChangeRole}>Изменить роль</button>
      </div>
      <div
        className="background"
        onClick={() => setIsModalWindowSelectedUser(false)}
      />
    </>
  );
}
