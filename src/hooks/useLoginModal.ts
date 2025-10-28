import { useState, useCallback } from 'react';

interface UseLoginModalReturn {
  isOpen: boolean;
  showModal: (message?: string) => void;
  hideModal: () => void;
  message?: string;
}

export const useLoginModal = (): UseLoginModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const showModal = useCallback((customMessage?: string) => {
    setMessage(customMessage);
    setIsOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
    setMessage(undefined);
  }, []);

  return {
    isOpen,
    showModal,
    hideModal,
    message
  };
};
