import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import { User, Product, QuestionInTheHelpBlog } from "./db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { unlink } from "fs/promises";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "public", "models");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, true);
  },
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.use("/models", express.static(path.join(__dirname, "public", "models")));

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Файл не получен" });
  res.json({ url: `/models/${req.file.filename}` });
});

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/myapp")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Регистрация
app.post("/api/register", async (req, res) => {
  try {
    const { username, login, password } = req.body;
    console.log("register body:", req.body);

    const exists = await User.findOne({ login });
    if (exists)
      return res.status(400).json({ message: "Пользователь уже существует" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      login,
      password: hashedPassword,
      role: "user",
    });

    res
      .status(201)
      .json({ message: "Пользователь создан", username: user.username });
  } catch (err) {
    console.error("register error:", err.message);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
});

// Добавление продукта
app.post("/api/addProduct", async (req, res) => {
  try {
    const newProduct = new Product({ ...req.body });
    const saved = await newProduct.save();

    const sellerId = req.body.shopmanInfo._id;

    await User.findByIdAndUpdate(sellerId, {
      $push: { saleProductArray: saved._id },
    });

    const obj = saved.toObject();
    obj._id = obj._id.toString();
    res.json(obj);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Ошибка базы" });
  }
});

app.post("/api/addProductInCart", async (req, res) => {
  try {
    const { idProduct, idUser } = req.body;
    if (!idProduct || !idUser) {
      return res
        .status(400)
        .json({ error: "Не переданы ID товара или пользователя" });
    }
    if (
      !mongoose.Types.ObjectId.isValid(idProduct) ||
      !mongoose.Types.ObjectId.isValid(idUser)
    ) {
      return res.status(400).json({ error: "Некорректный формат ID" });
    }
    const productExists = await Product.exists({ _id: idProduct });
    if (!productExists) {
      return res.status(404).json({ error: "Добавляемый товар не найден" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      idUser,
      { $addToSet: { productsCart: idProduct } },
      { returnDocument: "after" },
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json({updatedUser});
  } catch (e) {
    console.error("Ошибка при добавлении в корзину:", e.message);
    res.status(500).json({ error: "Ошибка сервера при работе с базой данных" });
  }
});

// Удаление продукта
app.post("/api/deleteProduct", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID не предоставлен" });
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Некорректный формат ID" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Документ не найден" });

    // 1. Удаление файла модели с диска
    if (product.modelPath) {
      const filename = path.basename(product.modelPath);
      const filePath = path.join(__dirname, "public", "models", filename);
      try {
        await unlink(filePath);
      } catch (e) {
        console.warn("Файл не найден при удалении:", filePath);
      }
    }
    const objectId = new mongoose.Types.ObjectId(id);
    await Promise.all([
      User.updateMany(
        { productsCart: objectId },
        { $pull: { productsCart: objectId } },
      ),
      User.updateMany(
        { saleProductArray: objectId },
        { $pull: { saleProductArray: objectId } },
      ),
    ]);

    // 3. Удаление самого товара из базы данных
    await Product.deleteOne({ _id: objectId });

    res.json({ success: true });
  } catch (err) {
    console.error("Ошибка на сервере:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Изменение продукта
app.post("/api/editProduct", async (req, res) => {
  try {
    const { id, ...rawData } = req.body;

    if (!id) return res.status(400).json({ error: "ID не предоставлен" });
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Некорректный формат ID" });

    const updateData = Object.fromEntries(
      Object.entries(rawData).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined,
      ),
    );

    if (Object.keys(updateData).length === 0)
      return res.status(400).json({ error: "Нет данных для обновления" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Товар не найден" });

    if (
      updateData.modelPath &&
      updateData.modelPath !== product.modelPath &&
      product.modelPath
    ) {
      const filename = path.basename(product.modelPath);
      const filePath = path.join(__dirname, "public", "models", filename);
      try {
        await unlink(filePath);
      } catch {
        console.warn("Старый файл не найден при замене:", filePath);
      }
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, lean: true },
    );

    updated._id = updated._id.toString();
    res.json(updated);
  } catch (err) {
    console.error("editProduct error:", err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получение всех продуктов
app.get("/api/getProducts", async (req, res) => {
  try {
    const productsArr = await Product.find().lean();
    res.json(productsArr.map((p) => ({ ...p, _id: p._id.toString() })));
  } catch (err) {
    console.error("getProducts error:", err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Вход
app.post("/api/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await User.findOne({ login });
    if (!user)
      return res.status(400).json({ message: "Неверный login или пароль" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Неверный username или пароль" });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        login: user.login,
        role: user.role,
        saleProductArray: user.saleProductArray, // Добавили это
        productsCart: user.productsCart, // И это, чтобы корзина не терялась
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
});

// Удаление пользователя
app.post("/api/deleteUser", async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ login });
    if (!user)
      return res.status(400).json({ message: "Неверный login или пароль" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Неверный пароль" });

    await User.deleteOne({ _id: user._id });
    res.json({ message: "Пользователь удалён" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
});

// Получение всех пользователей
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Смена роли
app.post("/api/changeRole", async (req, res) => {
  try {
    const { login, role } = req.body;
    const user = await User.findOne({ login });
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    user.role = role;
    await user.save();
    res.json({});
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Смена пароля
app.post("/api/changePassword", async (req, res) => {
  try {
    const { login, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ login });
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Неверный старый пароль" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const newUser = await User.findOne({ login });
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Смена имени
app.post("/api/changeName", async (req, res) => {
  try {
    const { login, newName, password } = req.body;
    const user = await User.findOne({ login });
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Неверный пароль" });

    user.username = newName;
    await user.save();

    const newUser = await User.findOne({ login });
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Смена логина
app.post("/api/changeLogin", async (req, res) => {
  try {
    const { login, newLogin, password } = req.body;
    const user = await User.findOne({ login });
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Неверный пароль" });

    user.login = newLogin;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Добавление вопроса
app.post("/api/addQuestion", async (req, res) => {
  try {
    const newQuestion = new QuestionInTheHelpBlog({ ...req.body });
    const saved = await newQuestion.save();
    const obj = saved.toObject();
    obj._id = obj._id.toString();
    res.json(obj);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: "Ошибка базы" });
  }
});

// Получение всех вопросов
app.get("/api/getQuestion", async (req, res) => {
  try {
    const questionsArr = await QuestionInTheHelpBlog.find().lean();
    res.json(questionsArr.map((p) => ({ ...p, _id: p._id.toString() })));
  } catch (err) {
    console.error("getQuestion error:", err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Удаление вопроса
app.post("/api/deleteQuestion", async (req, res) => {
  try {
    const { _id } = req.body;
    const question = await QuestionInTheHelpBlog.findOne({ _id });
    if (!question) return res.status(400).json({ message: "Неверный _id" });

    await QuestionInTheHelpBlog.deleteOne({ _id: question._id });
    res.json({ message: "Удалено" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
});

// Изменениие оценки вопроса
app.post("/api/selectRatingQuestion", async (req, res) => {
  try {
    const { _idQuestion, _idUser, categoryRating } = req.body;

    // 1. Поиск вопроса
    const question = await QuestionInTheHelpBlog.findById(_idQuestion);
    if (!question) {
      return res.status(404).json({ message: "Вопрос не найден" });
    }

    // 2. Проверка входных данных
    if (!_idUser) {
      return res.status(400).json({ message: "ID пользователя обязателен" });
    }

    // Проверяем наличие пользователя в списках (приводим к строке для сравнения)
    const isGood = question.goodRating.some(
      (id) => id.toString() === _idUser.toString(),
    );
    const isBad = question.badRating.some(
      (id) => id.toString() === _idUser.toString(),
    );

    // 3. Если пользователь нажал на ту же кнопку, что уже выбрана
    if (
      (categoryRating === "goodRating" && isGood) ||
      (categoryRating === "badRating" && isBad)
    ) {
      return res.status(400).json({ message: "Оценка уже поставлена" });
    }

    // 4. Удаляем пользователя из обоих массивов (смена или сброс оценки)
    question.goodRating.pull(_idUser);
    question.badRating.pull(_idUser);

    // 5. Добавляем в нужный массив
    if (categoryRating === "goodRating") {
      question.goodRating.push(_idUser);
    } else if (categoryRating === "badRating") {
      question.badRating.push(_idUser);
    }

    // 6. Сохраняем изменения в БД
    await question.save();

    return res.json({ message: "Успешно обновлено", question });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Ошибка сервера", error: err.message });
  }
});

// Изменениие вопроса
app.post("/api/editQuestion", async (req, res) => {
  try {
    const { id, updates } = req.body;

    if (!id) return res.status(400).json({ error: "ID не предоставлен" });

    const updated = await QuestionInTheHelpBlog.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, lean: true },
    );

    if (!updated) return res.status(404).json({ error: "Вопрос не найден" });

    res.json(updated);
  } catch (err) {
    console.error("editQuestion error:", err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});


app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// Запуск
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
