import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerStatusContext } from '../App';

function Home() {
  const isServerOnline = useContext(ServerStatusContext);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [listOfFoodItems, setListOfFoodItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState(4);

  let navigate = useNavigate();


  const fetchFoodItems = () => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      axios.get("http://localhost:3001/foodItems").then((response) => {
        console.log(response.data);
        setListOfFoodItems(response.data);
      }).catch(err => {
        console.log(err);
        alert("The server is currently offline. Your request will be retried later.");
        saveFailedRequest({ url: "http://localhost:3001/foodItems", method: "get" });
      });
    }
  };

  const saveFailedRequest = (request) => {
    let failedRequests = JSON.parse(localStorage.getItem("failedRequests")) || [];
    failedRequests.push(request);
    localStorage.setItem("failedRequests", JSON.stringify(failedRequests));
  };

  const retryFailedRequests = async () => {
    let failedRequests = JSON.parse(localStorage.getItem("failedRequests")) || [];
    for (let request of failedRequests) {
      try {
        await axios({ method: request.method, url: request.url, data: request.data });
      } catch (error) {
        console.log(`Retry failed for ${request.url}`);
        continue;
      }
    }
    localStorage.removeItem("failedRequests");
  };

  useEffect(() => {
    if (isServerOnline) {
      retryFailedRequests();
    }

    fetchFoodItems();

    const socket = new WebSocket('ws://localhost:3001'); // WebSocket URL
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const data = event.data;
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.type === 'new_item') {
          setListOfFoodItems(prevFoodItems => [...prevFoodItems, jsonData.data]);
        }
      } catch (error) {
        console.log('Non-JSON message received:', data);
      }
    };
    

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.close(); // Close WebSocket connection on component unmount
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate, isServerOnline]);

  const showMoreItems = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems + 4);
  };

  // if (!isServerOnline) {
  //   return <div>The server is currently offline. Please try again later.</div>;
  // }

  if (!isOnline) {
    return <div>You are currently offline. Please check your internet connection.</div>;
  }

  const numberOfItemsToDisplay = Math.min(visibleItems, listOfFoodItems.length);

  return (
    <div>
      {listOfFoodItems.slice(0, numberOfItemsToDisplay).map((value, key) => (
        <div key={key} className='foodItem'>
          <div className='foodItemName'> {value.name} </div>
          <div className='foodContentInfo' onClick={() => navigate(`/foodItem/${value.id}`)}> {value.foodContentInfo} </div>
          <img className='foodItemImage' src={value.imageURL} alt="Food Item Image" onClick={() => navigate(`/foodItem/${value.id}`)} />
          <div className='purchaseCount'> Purchased by {value.purchaseCount} </div>
          <div className='price'> {value.price} lei </div>
          <div className='username'>
            <Link to={`/profile/${value.UserId}`}> {value.username} </Link>
          </div>
        </div>
      ))}
      <div>{numberOfItemsToDisplay} / {listOfFoodItems.length}</div>
      {visibleItems < listOfFoodItems.length && (
        <button onClick={showMoreItems}>Show More</button>
      )}
    </div>
  );
}

export default Home;
