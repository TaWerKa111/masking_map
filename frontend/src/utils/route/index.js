import React from 'react';
import { Route, redirect, useNavigate} from 'react-router-dom';
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({user, children}) => {
    const navigate = useNavigate();
    console.log("protected user", user);
    
    if (user == null) {
        // return navigate("/login/"); 
        return <Navigate to="/login/"></Navigate>
    }
    return children;
};

export default ProtectedRoute;
