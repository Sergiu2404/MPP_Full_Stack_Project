import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, Tooltip, XAxis, YAxis } from 'recharts';
import axios from 'axios';

function Statistics() {
  const [listOfFoodItems, setListOfFoodItems] = useState([]);
  const [serverOnline, setServerOnline] = useState(true);
  const [pendingRequest, setPendingRequest] = useState(null);

  useEffect(() => {
    // Check server status upon component mount
    axios.get("http://localhost:3001/checkServerStatus")
      .then(() => {
        setServerOnline(true);
        // Execute pending request if server is back online
        if (pendingRequest) {
          executePendingRequest();
        }
      })
      .catch(() => setServerOnline(false));
  }, []);

  useEffect(() => {
    // Fetch data when the component mounts or when the server is back online
    if (serverOnline) {
      axios.get("http://localhost:3001/foodItems")
        .then((response) => {
          console.log(response.data);
          setListOfFoodItems(response.data);
        })
        .catch(error => {
          alert("you are offlne");
        })
    }
  }, [serverOnline]); // Re-fetch data when serverOnline state changes

  const executePendingRequest = () => {
    axios.get("http://localhost:3001/foodItems")
      .then((response) => {
        console.log(response.data);
        setListOfFoodItems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => setPendingRequest(null));
  };

  return (
    <div className='statisticsPage'>
      <BarChart
        width={800}
        height={400}
        data={listOfFoodItems}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="purchaseCount" fill="#216121" activeBar={<Rectangle fill="#1B501B" />} />
      </BarChart>
    </div>
  );
}

export default Statistics;
