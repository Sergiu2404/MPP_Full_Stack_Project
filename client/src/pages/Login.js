import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthState } = useContext(AuthContext);
  const [serverOnline, setServerOnline] = useState(true);
  const [pendingLogin, setPendingLogin] = useState(null);

  let navigate = useNavigate();

  useEffect(() => {
    // Check server status upon component mount
    axios.get("http://localhost:3001/checkServerStatus")
      .then(() => {
        setServerOnline(true);
        if (pendingLogin) {
          // If server is back online and there's a pending login, attempt login again
          login(pendingLogin);
        }
      })
      .catch(() => setServerOnline(false));
  }, []);

  const login = (data) => {
    axios.post("http://localhost:3001/auth/login", data)
      .then((response) => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          localStorage.setItem("accessToken", response.data.token);
          setAuthState({ username: response.data.username, id: response.data.id, status: true });
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
        if (!serverOnline) {
          // If server is offline, save login request for later
          setPendingLogin(data);
        }
      });
  }

  const handleLogin = () => {
    const data = { username, password };
    login(data);
  };

  return (
    <div className='loginContainer'>
      <label> Username: </label>
      <input type="text" onChange={(event) => { setUsername(event.target.value); }} />
      <label> Password: </label>
      <input type="password" onChange={(event) => { setPassword(event.target.value); }} />
      <button onClick={handleLogin}> Login </button>
    </div>
  );
}

export default Login;
