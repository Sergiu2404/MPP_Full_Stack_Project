import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from "../contexts/AuthContext";

function Profile() {
  let { id } = useParams(); // id of the current connected user
  let navigate = useNavigate();
  const { authState } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [listOfFoodItems, setListOfFoodItems] = useState([]);
  const [serverOnline, setServerOnline] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    // Check server status upon component mount
    axios.get("http://localhost:3001/checkServerStatus")
      .then(() => {
        setServerOnline(true);
        // Execute pending requests if server is back online
        if (pendingRequests.length > 0) {
          executePendingRequests();
        } else {
          fetchData();
        }
      })
      .catch(() => setServerOnline(false));
  }, []);

  const fetchData = () => {
    axios.get(`http://localhost:3001/auth/basicInfo/${id}`)
      .then((response) => {
        setUsername(response.data.username);
      })
      .catch(handlePendingRequest);

    axios.get(`http://localhost:3001/foodItems/byUserId/${id}`)
      .then((response) => {
        setListOfFoodItems(response.data);
      })
      .catch(handlePendingRequest);
  };

  const handlePendingRequest = (error) => {
    console.error("Request failed:", error);
    if (!serverOnline) {
      // Save pending request data to execute later
      setPendingRequests([...pendingRequests, fetchData]);
    }
  };

  const executePendingRequests = () => {
    setPendingRequests([]);
    fetchData();
  };

  return (
    <div className='profilePageContainer'>
      <div className='basicInfo' style={{ textAlign: 'center' }}>
        <h3>username: {username}</h3>
        {authState.username === username && <button onClick={() => { navigate("/changePassword"); }}> Change password: </button>}
        <div className='listOfFoodItems'>
          {listOfFoodItems.map((value, key) => {
            return (
              <div key={key} className='foodItem'>
                <div className='foodItemName'> {value.name} </div>
                <div className='foodContentInfo' onClick={() => { navigate(`/foodItem/${value.id}`); }}> {value.foodContentInfo} </div>
                <img className='foodItemImage' src={value.imageURL} alt="Food Item Image" onClick={() => { navigate(`/foodItem/${value.id}`); }} />
                <div className='purchaseCount'> Purchased by {value.purchaseCount} </div>
                <div className='price'> {value.price} lei </div>
                <div className='username'> {value.username} </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Profile;
