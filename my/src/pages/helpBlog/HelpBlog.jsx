import { useEffect, useState } from "react";
import "./HelpBlog.css";
import { addQuestion, deleteQuestion, getQuestion } from "../../auth";
import ModalWindowAddQuestion from "./ModalWindowAddQuestion";
import WindowSelectedQuestion from "./WindowSelectedQuestion";
export default function HelpBlog({ user }) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [modalWindow, setIsModalWindow] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [error, setError] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const data = await getQuestion();
      setAllQuestions(data);
    };
    fetchQuestions();
  }, []);

  const handleAddProduct = async () => {
    setError(null);
    await addQuestiion("title", "text");
    const data = await getQuestion();
    setAllQuestions(data);
  };

  const handleDeleteProduct = async (_id) => {
    setError(null);
    await deleteQuestion(_id);
    const data = await getQuestion();
    setAllQuestions(data);
  };

  return (
    <div className="helpBlog">
      <div className="leftBlock">
        <p className="titleInLeftBlock">Часто задаваемые вопросы: </p>
        {allQuestions.length > 0 ? (allQuestions.map((question) => (
          <div
            className="questionBlock"
            onClick={() => setSelectedQuestion(question)}
            key={question._id}
          >
            
            <p>{question.title}</p>
          </div>
        ))): <p>Пока что нет вопросов, по которым нужна помощь</p>}
        {user?.role === "admin" && (
        <div
          className="btns addProductButton"
          onClick={() => setIsModalWindow(true)}
        >
          +
        </div>
      )}
      </div>

      <div className="rightBlockQuestion">
        <WindowSelectedQuestion selectedQuestion={selectedQuestion} user={user}/>
      </div>

      {modalWindow && (
        <ModalWindowAddQuestion
          setIsModalWindow={setIsModalWindow}
          setAllQuestions={setAllQuestions}
        />
      )}
      
    </div>
  );
}
