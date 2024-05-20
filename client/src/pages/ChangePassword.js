import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [serverOnline, setServerOnline] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);

  const changePassword = () => {
    const data = {
      oldPassword: oldPassword,
      newPassword: newPassword
    };
    const request = {
      url: "http://localhost:3001/auth/changePassword",
      method: "put",
      data: data,
      headers: { accessToken: localStorage.getItem("accessToken") }
    };
    sendRequest(request);
  };

  const sendRequest = (request) => {
    axios(request)
      .then((response) => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          alert("Your password has been changed successfully");
        }
      })
      .catch((error) => {
        console.error("Error sending request:", error);
        if (!serverOnline) {
          // Server is offline, save request to pending requests
          setPendingRequests([...pendingRequests, request]);
          alert("The server is currently offline. Your request will be sent when the server is back online.");
        }
      });
  };

  useEffect(() => {
    // Check server status
    axios.get("http://localhost:3001/checkServerStatus")
      .then(() => setServerOnline(true))
      .catch(() => setServerOnline(false));

    // Send pending requests when server is back online
    if (serverOnline && pendingRequests.length > 0) {
      pendingRequests.forEach(request => {
        sendRequest(request);
      });
      setPendingRequests([]);
    }
  }, [serverOnline, pendingRequests]);

  return (
    <div className='changePasswordPage'>
      <h2> Change your password: </h2>
      <input name="oldPassword" type="password" placeholder='old password...' onChange={(event) => { setOldPassword(event.target.value); }}></input>
      <input name="newPassword" type="password" placeholder='new password...' onChange={(event) => { setNewPassword(event.target.value); }}></input>
      <button onClick={changePassword}> Save change </button>
    </div>
  )
}

export default ChangePassword;
