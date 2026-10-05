import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '../types';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  userEmail: string;
}

const RoleContext = createContext<RoleContextType | null>(null);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('QC'); // Default to QC to showcase Maker-Checker approval and Exception workflows

  const getUserDetails = () => {
    switch (role) {
      case 'PROCESSOR':
        return { name: 'Rahul Sharma', email: 'rahul.processor@mdindia.com' };
      case 'QC':
        return { name: 'Sunil Deshmukh', email: 'sunil.qc@mdindia.com' };
      case 'ADMIN':
        return { name: 'Priya Kulkarni', email: 'priya.admin@mdindia.com' };
    }
  };

  const { name, email } = getUserDetails();

  return (
    <RoleContext.Provider value={{ role, setRole, userName: name, userEmail: email }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
