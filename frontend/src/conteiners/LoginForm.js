import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiInst } from "../utils/axios";
import send_notify from "../utils/toast";

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        let userdata = { login: username, password: password };
        console.log(userdata);
        apiInst.post("/auth/login/", userdata)
            .then(resp => {
                if (resp.status === 200){
                    localStorage.setItem("username", username);
                    localStorage.setItem("password", password);
                    localStorage.setItem("is_login", true);
                    onLogin();
                    navigate("/");
                    // window.location.reload(false);
                    send_notify(resp.data.message, "success");
                }
            })
            .catch(
            e => {
                console.log(e);
                send_notify(e.response.data.message, "error");
            });
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
