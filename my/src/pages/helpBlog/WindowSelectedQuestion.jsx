import { useEffect, useState } from "react";
import { deleteQuestion, getQuestion, selectRatingQuestion } from "../../auth";

export default function WindowSelectedQuestion({
  selectedQuestion,
  user,
  setAllQuestions,
  setSelectedQuestion,
}) {
  const handleDeleteProduct = async () => {
    await deleteQuestion(selectedQuestion._id);
    const data = await getQuestion();
    setAllQuestions(data);
    setSelectedQuestion(null);
  };

  const changeOrSelectRating = async (categoryRating) => {
    if (!selectedQuestion?._id || !user?.id) {
      console.log(selectedQuestion._id, user.id);
      console.error("Отсутствует ID вопроса или пользователя");
      return;
    }

    try {
      await selectRatingQuestion(selectedQuestion._id, user.id, categoryRating);
      const data = await getQuestion();
      setAllQuestions(data);
      const nowSelectedQuestionIndex = data.findIndex(
        (item) => item._id == selectedQuestion._id,
      );
      setSelectedQuestion(data[nowSelectedQuestionIndex]);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      {selectedQuestion ? (
        <div className="windowSelectedQuestion">
          <p className="titleQuestion">{selectedQuestion.title}</p>
          <p className="textQuestion">{selectedQuestion.text}</p>
          <div className="selectRating">
            Эта статься помогла вам:
            <span
              onClick={() => changeOrSelectRating("goodRating")}
              className="rating goodRating"
              style={
                selectedQuestion?.goodRating.includes(user.id)
                  ? { fontWeight: "700" }
                  : { fontWeight: "500" }
              }
            >
              да {selectedQuestion?.goodRating.length}
            </span>
            |
            <span
              onClick={() => changeOrSelectRating("badRating")}
              className="rating badRating"
              style={
                selectedQuestion?.badRating.includes(user.id)
                  ? { fontWeight: "700" }
                  : { fontWeight: "500" }
              }
            >
              нет {selectedQuestion?.badRating.length}
            </span>
          </div>
          {user.role === "admin" && (
            <div
              className="btns deleteQuestion"
              onClick={() => handleDeleteProduct()}
            >
              Удалить
            </div>
          )}
        </div>
      ) : (
        <div className="selQuestionFalse">
          Начните узнавать новое про сайт и выберите подходящий вопрос
        </div>
      )}
    </>
  );
}
