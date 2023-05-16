import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import send_notify from "../utils/toast";

const Logout = ({ onLogout }) => {
    const navigate = useNavigate();

    useEffect(() => {
        onLogout();
        navigate("/");
        // window.location.reload(false);
        send_notify("Пользователь вышел из приложения!", "success");
    }, []);

    return <h1></h1>;
};

export default Logout;
