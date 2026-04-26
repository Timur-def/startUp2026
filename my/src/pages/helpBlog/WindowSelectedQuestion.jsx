import { useEffect, useState } from "react";
import { deleteQuestion, getQuestion } from "../../auth";

export default function WindowSelectedQuestion({
  selectedQuestion,
  user,
  setAllQuestions,
  setSelectedQuestion
}) {
  console.log(selectedQuestion);

  const handleDeleteProduct = async () => {
    await deleteQuestion(selectedQuestion._id);
    const data = await getQuestion();
    setAllQuestions(data);
    setSelectedQuestion(null)
  };

  return (
    <>
      {selectedQuestion ? (
        <div className="windowSelectedQuestion">
          <p className="titleQuestion">{selectedQuestion.title}</p>
          <p className="textQuestion">{selectedQuestion.text}</p>
          <div className="selectRating">
            <span className="">{selectedQuestion.goodRating.length}</span> |{" "}
            <span className="">{selectedQuestion.badRating.length}</span>
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
