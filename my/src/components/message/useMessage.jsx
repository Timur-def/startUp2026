import { useState, useCallback } from 'react';
import Message from './Message'; 

export const useMessage = () => {
  const [msgState, setMsgState] = useState({
    isVisible: false,
    count: 0,
    text: '',
    isError: false,
  });

  // Стабильная ссылка на функцию
  const triggerMessage = useCallback((text, isError = false) => {
    setMsgState((prev) => ({
      isVisible: true,
      count: prev.count + 1,
      text: text,
      isError: isError,
    }));

    setTimeout(() => {
      setMsgState((prev) => ({ ...prev, isVisible: false }));
    }, 4000);
  }, []);

  const renderMessage = () => {
    if (!msgState.isVisible) return null;
    return (
      <Message
        key={msgState.count}
        text={msgState.text}
        type={msgState.isError ? "error" : "notErr"}
      />
    );
  };

  return { triggerMessage, renderMessage };
};
