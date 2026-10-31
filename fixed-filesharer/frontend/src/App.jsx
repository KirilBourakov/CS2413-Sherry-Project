//css
import './resources/css/custom.scss';

//react & js
import { createContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// componenets
import Navbar from './components/navbar';
import Home from './pages/home/';
import CreateAccount from './pages/create-account';
import Login from './pages/login';
import Storage from './pages/storage';
import LogoutView from './pages/logout';
import Item from './pages/preview';
import Search from './pages/search';

// providers
import AuthProvider from './components/providers/authProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar/>
        <div>
          <Routes> 

            {/* unprotected routes */}
            <Route path="/" element={<Home/>} />
            <Route path="/search" element={<Search/>}/>
            <Route path="/item/:id" element={<Item />}/>

            {/* login/out */}
            <Route path="/Create-account" element={<CreateAccount/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/logout" element={<LogoutView/>}/>
            
            {/* protected routes */}
            <Route path="/storage" element={<Storage />}/>
            <Route path="/storage/*" element={<Storage />}/>
              
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
