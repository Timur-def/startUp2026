const API = "http://localhost:3001/api";

export async function register(username, userlogin, password) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, login: userlogin, password }),
  });
  return res.json();
}

export async function login(userlogin, password) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: userlogin, password }),
  });
  const data = await res.json();
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export async function deleteUser(userlogin, password) {
  const res = await fetch(`${API}/deleteUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: userlogin, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Ошибка при удалении");
  }

  localStorage.removeItem("user");
  return data;
}

export function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export async function getUsers() {
  try {
    const response = await fetch(`${API}/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Ошибка при получении пользователей");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("getUsers error:", err.message);
    return [];
  }
}

export function logout() {
  localStorage.removeItem("user");
}

export async function addProduct(data, file) {
  try {
    let modelPath = "";

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`http://localhost:3001/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Ошибка загрузки файла");
      const { url } = await uploadRes.json();
      modelPath = url;
    }

    await fetch(`${API}/addProduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, modelPath }),
    });
  } catch (err) {
    console.error("addProduct error:", err.message);
  }
}

export async function deleteProduct(data) {
  try {
    await fetch(`${API}/deleteProduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error("error:", err.message);
    return [];
  }
}

export async function getProducts() {
  try {
    const response = await fetch(`${API}/getProducts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Ошибка при получении");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("error:", err.message);
    return [];
  }
}

export async function editProduct(id, data, file) {
  try {
    // 1. Формируем чистый объект данных (без пустых строк)
    const cleanData = {};

    if (data.title) cleanData.title = data.title;
    if (data.description) cleanData.description = data.description;
    if (data.price) cleanData.price = data.price;

    // Обрабатываем вложенный объект продавца
    const shopman = {};
    if (data.shopmanInfo?.name) shopman.name = data.shopmanInfo.name;
    if (data.shopmanInfo?.phoneNumber)
      shopman.phoneNumber = data.shopmanInfo.phoneNumber;
    if (data.shopmanInfo?.addressHome)
      shopman.addressHome = data.shopmanInfo.addressHome;

    // Добавляем инфо о продавце, только если там есть хотя бы одно поле
    if (Object.keys(shopman).length > 0) {
      cleanData.shopmanInfo = shopman;
    }

    const payload = { id, ...cleanData };

    // 2. Обработка файла (остается как была)
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`http://localhost:3001/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Ошибка загрузки файла");
      const { url } = await uploadRes.json();
      payload.modelPath = url;
    }

    // 3. Отправка
    const res = await fetch(`${API}/editProduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json(); // Попробуем достать текст ошибки от сервера
      console.error("Детали ошибки от сервера:", errorData);
      throw new Error("Ошибка редактирования товара");
    }
    return await res.json();
  } catch (err) {
    console.error("editProduct error:", err.message);
    throw err; // Прокидываем ошибку дальше для обработки в UI
  }
}

export async function changeRole(login, role) {
  const res = await fetch(`${API}/changeRole`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, role }),
  });
  return res.json();
}

export async function changePassword(login, oldPassword, newPassword) {
  const res = await fetch(`${API}/changePassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, oldPassword, newPassword }),
  });
  const data = await res.json();
  if (data) {
    localStorage.setItem("user", JSON.stringify(data));
  }
  return data;
}

export async function changeName(login, newName, password) {
  const res = await fetch(`${API}/changeName`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, newName, password }),
  });
  const data = await res.json();
  if (data) {
    localStorage.setItem("user", JSON.stringify(data));
  }
  return data;
}

export async function changeLogin(login, newLogin, password) {
  const res = await fetch(`${API}/changeLogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, newLogin, password }),
  });
  const data = await res.json();
  if (data) {
    localStorage.setItem("user", JSON.stringify(data));
  }

  return data;
}

export async function addQuestion(title, text) {
  const res = await fetch(`${API}/addQuestion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, text }),
  });
  return res.json();
}

export async function getQuestion() {
  try {
    const response = await fetch(`${API}/getQuestion`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Ошибка при получении");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("error:", err.message);
    return [];
  }
}

export async function deleteQuestion(_id) {
  try {
    await fetch(`${API}/deleteQuestion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    });
  } catch (err) {
    console.error("error:", err.message);
    return [];
  }
}
export async function selectRatingQuestion(
  _idQuestion,
  _idUser,
  categoryRating,
) {
  try {
    const response = await fetch(`${API}/selectRatingQuestion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _idQuestion, _idUser, categoryRating }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Бросаем ошибку с сообщением от сервера (например, "Оценка уже поставлена")
      throw new Error(result.message || "Ошибка при выборе рейтинга");
    }

    return result;
  } catch (err) {
    console.error("API Error:", err.message);
    throw err; // Пробрасываем ошибку дальше в компонент
  }
}

export async function editQuestion(data) {
  try {
    const res = await fetch(`${API}/editQuestion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Детали ошибки от сервера:", errorData);
    }
  } catch (err) {
    console.error("error:", err.message);
    throw err;
  }
}
