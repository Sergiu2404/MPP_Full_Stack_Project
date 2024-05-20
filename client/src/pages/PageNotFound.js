import React from 'react';
import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div>
        <h2>
        Page Not Found :/
        </h2>
        <h4>GO to home page: <Link to="/"> Home </Link></h4>
    </div>
  )
}

export default PageNotFound