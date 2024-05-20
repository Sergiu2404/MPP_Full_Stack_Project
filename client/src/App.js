import './App.css';
import Home from './pages/Home';
import CreateFoodItem from './pages/CreateFoodItem';
import FoodItem from './pages/FoodItem';
import Login from './pages/Login';
import Registration from './pages/Registration';

import { createContext, useEffect, useState } from 'react';
import { Routes, Route, BrowserRouter, Link } from 'react-router-dom';
import axios from 'axios';

import { AuthContext } from './contexts/AuthContext';
import PageNotFound from './pages/PageNotFound';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
import ChangePassword from './pages/ChangePassword';

export const ServerStatusContext = createContext(true);

function App() {
  const [authState, setAuthState] = useState({ username: "", id: 0, status: false });
  const [isServerOnline, setIsServerOnline] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3001/auth/auth", {
      headers: { accessToken: localStorage.getItem("accessToken") }
    }).then((response) => {
      if (response.data.error) {
        setAuthState({ ...authState, status: false });
      } else {
        setAuthState({
          username: response.data.username,
          id: response.data.id,
          status: true
        });
      }
    })
    .catch(error => {
      alert("you are offlne");
    });

    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/status');
        if (response.ok) {
          setIsServerOnline(true);
        } else {
          setIsServerOnline(false);
        }
      } catch (error) {
        setIsServerOnline(false);
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 8000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({ username: "", id: 0, status: false });
  };

  return (
    <div className="App">
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <ServerStatusContext.Provider value={isServerOnline}>
          <BrowserRouter>
            <div className="navbar">
              <div className='navbar-left'>
                {!authState.status ? (
                  <>
                    <Link to="/registration"> Register </Link>
                    <Link to="/login"> Login </Link>
                  </>
                ) : (
                  <>
                    <Link to="/"> Home </Link>
                    <Link to="/createFoodItem"> Create Food Item </Link>
                    <Link to="/statistics">See statistics</Link>
                  </>
                )}
              </div>
              {authState.status && (
                <div className='navbar-right'>
                  <h3>Connected as {authState.username}</h3>
                  <button onClick={logout}> Log out </button>
                </div>
              )}
            </div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/createFoodItem" element={<CreateFoodItem />} />
              <Route path="/foodItem/:id" element={<FoodItem />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/changePassword" element={<ChangePassword />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </BrowserRouter>
        </ServerStatusContext.Provider>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
