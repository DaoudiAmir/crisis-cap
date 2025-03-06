import React from 'react';
import { ToastContainer } from './Toast';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};

export default ToastProvider;
