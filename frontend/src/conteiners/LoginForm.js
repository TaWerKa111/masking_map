import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiInst } from "../utils/axios";

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        localStorage.setItem("is_login", true);
        try {
            let userdata = { login: username, password: password };
            console.log(userdata);
            const response = apiInst.post("/auth/login/", userdata);
            onLogin();
            navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Username:
                <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />
            </label>
            <label>
                Password:
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
            </label>
            <button type="submit">Log in</button>
        </form>
    );
};

export default LoginForm;
