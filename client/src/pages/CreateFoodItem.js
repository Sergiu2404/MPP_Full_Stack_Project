import React, { useContext, useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function CreateFoodItem() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  const initialValues = {
    name: "",
    foodContentInfo: "",
    imageURL: "",
    purchaseCount: "",
    price: ""
  };

  const [serverOnline, setServerOnline] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);

  const onSubmit = (data) => {
    const request = {
      url: "http://localhost:3001/foodItems",
      method: "post",
      data: data,
      headers: { accessToken: localStorage.getItem("accessToken") }
    };
    sendRequest(request);
  };

  const sendRequest = (request) => {
    axios(request)
      .then((response) => {
        navigate("/");
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

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(),
    foodContentInfo: Yup.string().required(),
    imageURL: Yup.string().required(),
    purchaseCount: Yup.number().required().positive().integer(),
    price: Yup.number().required().positive()
  });

  useEffect(() => {
    if (!localStorage.getItem("accessToken"))
      navigate("/login");

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
  }, [navigate, serverOnline, pendingRequests]);

  return (
    <div className='createFoodItemPage'>
      <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
        <Form className='formContainer'>
          <label>Name: </label>
          <ErrorMessage name="name" component="span"></ErrorMessage>
          <Field autoComplete="off" id="inputCreateFoodItem" name="name" placeholder="input name..." />
          <label>Food content: </label>
          <ErrorMessage name="foodContentInfo" component="span"></ErrorMessage>
          <Field autoComplete="off" id="inputCreateFoodItem" name="foodContentInfo" placeholder="input content..." />
          <label>URL: </label>
          <ErrorMessage name="imageURL" component="span"></ErrorMessage>
          <Field autoComplete="off" id="inputCreateFoodItem" name="imageURL" placeholder="input URL..." />
          <label>Purchase Count: </label>
          <ErrorMessage name="purchaseCount" component="span"></ErrorMessage>
          <Field autoComplete="off" id="inputCreateFoodItem" name="purchaseCount" placeholder="input purchase count..." />
          <label>Price: </label>
          <ErrorMessage name="price" component="span"></ErrorMessage>
          <Field autoComplete="off" id="inputCreateFoodItem" name="price" placeholder="input price..." />
          <button type="submit">Create food item</button>
        </Form>
      </Formik>
    </div>
  )
}

export default CreateFoodItem;
