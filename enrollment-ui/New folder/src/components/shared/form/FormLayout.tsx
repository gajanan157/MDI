import React, { ReactNode } from 'react';

interface FormLayoutProps {
  id?: string; 
  FormClassName?: string;
  onSubmit?: React.FormEventHandler<HTMLFormElement>; 
  children: ReactNode;
}

const FormLayout: React.FC<FormLayoutProps> = ({ FormClassName, onSubmit, children }) => {
  return (
    <form onSubmit={onSubmit} className={FormClassName}>
     {children}
    </form>
  );
};

export default FormLayout;
