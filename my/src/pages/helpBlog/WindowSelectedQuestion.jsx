import { useEffect, useState } from "react";

export default function WindowSelectedQuestion({ selectedQuestion, user }) {
  console.log(selectedQuestion);

  return (
    <>
      {selectedQuestion ? (
        <div className="windowSelectedQuestion">
          <p className="titleQuestion">{selectedQuestion.title}</p>
          <p className="textQuestion">{selectedQuestion.text}</p>
          <div className="selectRating">
            <span className="">{selectedQuestion.goodRating.length}</span> | <span className="">{selectedQuestion.badRating.length}</span>
           </div>
          {user.role === "admin" && (
              <div
                className="btns deleteQuestion"
                onClick={() => handleDeleteProduct(question._id)}
              >
                -
              </div>
            )}
        </div>
      ) : (
        <div>
            Начните узнавать новое про сайт и выберите подходящий вопрос
        </div>
      )}
    </>
  );
}
