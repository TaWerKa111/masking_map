import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Logout = ({ onLogout }) => {
    const navigate = useNavigate();

    useEffect(() => {
        onLogout();
        navigate("/");
    }, []);
    return <h1></h1>;
};

export default Logout;
