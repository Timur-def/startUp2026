import { useState } from "react";
import { createPortal } from "react-dom";
import { addQuestion, getQuestion } from "../../auth";

export default function ModalWindowAddQuestion({ setIsModalWindowAddQuestion, setAllQuestions }) {
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const handleAddProduct = async () => {
    if (!text || !title) {
      return setError("Не заполнено одно из полей");
    }
    setError(null);
    await addQuestion(title, text);
    const data = await getQuestion();
    setAllQuestions(data);
    setText("");
    setTitle("");
    setIsModalWindowAddQuestion(false)
  };

  return createPortal(
    <>
      <div className="modalWindow">
        <p className="titleInModalWindow">Информация о вопросе: </p>
        <input
          className="textInput"
          type="text"
          placeholder="Заголовок"
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="textInput bigInp"
          type="text"
          placeholder="Содержание"
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          className="btn addProductBtnInWindow"
          onClick={handleAddProduct}
        >
          Добавить
        </button>
      </div>
      <div className="background" onClick={() => setIsModalWindowAddQuestion(false)} />
    </>,
    document.body,
  );
}
