import React from 'react';
import LoginScreen from './components/LoginScreen';
import MainApp from './components/MainApp';
import { useAppData } from './hooks/useAppData';

const UserApp: React.FC = () => {
  const { currentUser } = useAppData();

  return currentUser ? <MainApp /> : <LoginScreen />;
};

export default UserApp;
