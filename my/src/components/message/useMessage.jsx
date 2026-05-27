import { useState, useCallback, useRef, useEffect } from 'react';
import Message from './Message'; 

export const useMessage = () => {
  const [msgState, setMsgState] = useState({
    isVisible: false,
    count: 0,
    text: '',
    isError: false,
  });

  // Хранилище для ID активного тайм-аута
  const timeoutRef = useRef(null);

  const triggerMessage = useCallback((text, isError = false) => {
    // 1. Сброс предыдущего тайм-аута
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 2. Обновление состояния для нового сообщения
    setMsgState((prev) => ({
      isVisible: true,
      count: prev.count + 1,
      text: text,
      isError: isError,
    }));

    // 3. Установка нового тайм-аута
    timeoutRef.current = setTimeout(() => {
      setMsgState((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  // Очистка тайм-аута при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const renderMessage = () => {
    if (!msgState.isVisible) return null;
    return (
      <Message
        key={msgState.count} // Перемонтирует компонент Message
        text={msgState.text}
        type={msgState.isError ? "error" : "notErr"}
      />
    );
  };

  return { triggerMessage, renderMessage };
};
