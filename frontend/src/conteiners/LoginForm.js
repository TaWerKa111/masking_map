import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiInst } from "../utils/axios";

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        let userdata = { login: username, password: password };
        console.log(userdata);
        apiInst.post("/auth/login/", userdata)
            .then(resp => {
                if (resp.status === 200){
                    onLogin();
                    navigate("/");
                    localStorage.setItem("username", username);
                    localStorage.setItem("password", password);
                    localStorage.setItem("is_login", true);
                }
            })
            .catch(
                e => (console.log(e))
            );
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <div className="login-form">
                    <form onSubmit={handleSubmit}>
                        <div class="mb-3">
                        <label className="form-label h5">
                            Имя пользователя:
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            className="form-control"
                        />
                        </div>
                        <div class="mb-3">
                        <label className="form-label h5">
                            Пароль:
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="form-control"
                        />
                        </div>
                        <button type="submit" class="btn btn-primary">Войти</button>
                    </form>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default LoginForm;
