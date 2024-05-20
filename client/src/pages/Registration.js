import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Registration() {
    const navigate = useNavigate();
    const [serverOnline, setServerOnline] = useState(true);
    const [pendingRequest, setPendingRequest] = useState(null);

    useEffect(() => {
        // Check server status upon component mount
        axios.get("http://localhost:3001/checkServerStatus")
            .then(() => {
                setServerOnline(true);
                // Execute pending registration request if server is back online
                if (pendingRequest) {
                    executePendingRequest();
                }
            })
            .catch(() => setServerOnline(false));
    }, []);

    const initialValues = {
        username: "",
        password: ""
    }

    const validationSchema = Yup.object().shape({
        username: Yup.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters').required('Username is required'),
        password: Yup.string().min(8, 'Password must be at least 8 characters').max(20, 'Password must be less than 20 characters').required('Password is required')
    });

    const onSubmit = (data) => {
        if (serverOnline) {
            // If server is online, submit registration request
            axios.post("http://localhost:3001/auth", data)
                .then((response) => {
                    if (response.data === "Success") {
                        navigate("/login");
                    } else {
                        console.log("Registration failed");
                    }
                })
                .catch((error) => {
                    console.error("There was an error during registration:", error);
                });
        } else {
            // If server is offline, save registration request to be executed later
            setPendingRequest(data);
        }
    };

    const executePendingRequest = () => {
        axios.post("http://localhost:3001/auth", pendingRequest)
            .then((response) => {
                if (response.data === "Success") {
                    navigate("/login");
                } else {
                    console.log("Registration failed");
                }
            })
            .catch((error) => {
                console.error("There was an error during registration:", error);
            })
            .finally(() => setPendingRequest(null));
    };

    return (
        <div className='registrationPage'>
            <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                <Form className='formContainer'>
                    <label>Username: </label>
                    <ErrorMessage name="username" component="span" />
                    <Field autoComplete="off" id="inputCreateFoodItem" name="username" placeholder="input username..." />

                    <label>Password: </label>
                    <ErrorMessage name="password" component="span" />
                    <Field type="password" autoComplete="off" id="inputCreateFoodItem" name="password" placeholder="input password..." />
                    
                    <button type="submit"> Submit </button>
                </Form>
            </Formik>
        </div>
    )
}

export default Registration;
