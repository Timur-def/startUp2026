import { useState } from "react";
import { createPortal } from "react-dom";
import { editQuestion, getQuestion } from "../../auth";

export default function ModalWindowAddQuestion({
  setIsModalWindowEditQuestion,
  setAllQuestions,
  selectedQuestion,
  setSelectedQuestion,
  _id,
}) {
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const handleEditProduct = async () => {
    const updates = {};
    if (title) updates.title = title;
    if (text) updates.text = text;
    if (Object.keys(updates).length === 0) {
      return setError("Не заполнено ни одно из полей");
    }
    setError(null);
    await editQuestion({ id: _id, updates });
    const data = await getQuestion();
    setAllQuestions(data);
    const nowSelectedQuestionIndex = data.findIndex(
      (item) => item._id == selectedQuestion._id,
    );
    setSelectedQuestion(data[nowSelectedQuestionIndex]);
    setText("");
    setTitle("");
    setIsModalWindowEditQuestion(false);
  };

  return createPortal(
    <>
      <div className="windowAddButton">
        <p className="titleInModalWindow">Информация о вопросе: </p>
        <input
          className="textInput"
          type="text"
          placeholder="Заголовок"
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="textInput"
          type="text"
          placeholder="Содержание"
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          className="btn addProductBtnInWindow"
          onClick={handleEditProduct}
        >
          Изменить
        </button>
      </div>
      <div
        className="background"
        onClick={() => setIsModalWindowEditQuestion(false)}
      />
    </>,
    document.body,
  );
}
