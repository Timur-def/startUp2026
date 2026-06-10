import "./Chats.css";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { getUser, getMyDialogs, initSocket } from "../../auth";

export default function ChatsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const sellerFromUrl = queryParams.get("seller");
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [activeChatWith, setActiveChatWith] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    if (user) {
      const myUserLogin = user.login || user.username;

      getMyDialogs(myUserLogin).then((data) => {
        if (sellerFromUrl) {
          const alreadyExists = data.find(
            (u) => u.login === sellerFromUrl || u.username === sellerFromUrl,
          );

          if (!alreadyExists) {
            const newContact = {
              login: sellerFromUrl,
              username: sellerFromUrl,
            };
            setUsersList([newContact, ...data]);
            setActiveChatWith(newContact);
          } else {
            setUsersList(data);
            setActiveChatWith(alreadyExists);
          }
        } else {
          setUsersList(data);
        }
      });
    }
  }, [sellerFromUrl]);

  useEffect(() => {
    if (!currentUser || !activeChatWith) return;
    // Подключаемся к сокетам через ваш файл auth.js
    socketRef.current = initSocket();
    const myIdentifier = currentUser.login || currentUser.username;
    const targetIdentifier = activeChatWith.login || activeChatWith.username;
    socketRef.current.emit("joinPrivateChat", {
      myLogin: myIdentifier,
      targetLogin: targetIdentifier,
    });
    // Слушаем выгрузку истории из MongoDB
    socketRef.current.on("chatHistory", (history) => {
      setMessages(history);
    });
    // Слушаем новые входящие сообщения в реальном времени
    socketRef.current.on("receivePrivateMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      setMessages([]);
    };
  }, [currentUser, activeChatWith]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputValue.trim() || !socketRef.current) return;

    const myIdentifier = currentUser.login || currentUser.username;
    const targetIdentifier = activeChatWith.login || activeChatWith.username;

    console.log("[SOCKET FRONTEND] Отправляем объект:", {
      myLogin: myIdentifier,
      targetLogin: targetIdentifier,
      text: inputValue,
    });

    // Отправляем стандартное событие в виде объекта
    socketRef.current.emit("sendPrivateMessage", {
      myLogin: myIdentifier,
      targetLogin: targetIdentifier,
      text: inputValue,
    });

    setInputValue("");
  };

  const handleSelectUser = (user) => {
    const targetLogin = user.login || user.username;
    navigate(`/chats?seller=${targetLogin}`);
  };

  if (!currentUser) return <div className="signInText">Авторизуйтесь</div>;

  return (
    <div className="chats">
      <div className="rightColumn">
        <div className="usersList">
          {usersList.length === 0 ? (
            <div className="textNotActiveChat">
              У вас пока нет активных чатов
            </div>
          ) : (
            usersList.map((u) => (
              <div
                key={u.login || u.username}
                onClick={() => handleSelectUser(u)}
                className={`chatWithUser ${(activeChatWith?.login === u.login ||
                    activeChatWith?.username === u.username) && "active"}`}
              >
                <span className="leftGreenBlock"/> {u.username || u.login}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="windowActiveChat">
        {activeChatWith ? (
          <>
            <div className="titleChat">
              {activeChatWith.username || activeChatWith.login}
            </div>
            <div className="chatWindow">
              {messages.map((msg, idx) => {
                const myIdentifier = currentUser.login || currentUser.username;
                const isMe = msg.sender === myIdentifier;

                return (
                  <div key={idx} className={`message ${isMe && "messageMe"}`}>
                    <div
                      className={`textInMessage ${isMe && "textInMessageMe"}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="windowInput">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Введите сообщение"
                className="input"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="btnSendMessage"
              >
                Отправить
              </button>
            </div>
          </>
        ) : (
          <div className="windowNotSelectedChat">
            Выберите диалог слева или перейдите со страницы товара, чтобы начать
            общение
          </div>
        )}
      </div>
    </div>
  );
}
