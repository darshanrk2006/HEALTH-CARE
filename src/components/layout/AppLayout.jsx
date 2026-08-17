import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import './AppLayout.css';

const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main-content">
        <div className="page-wrapper">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
