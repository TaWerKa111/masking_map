import React, { useEffect } from "react";
import Navbar from "../components/main/Navbar";
import Foot from "../components/main/Foot";
import NavAuthBar from "../components/main/NavAuthBar";
import { useState } from "react";

const Layout = (props) => {
    const [user, setUser] = useState(localStorage.getItem("is_login"));

    return (
        <div>
            {user === "true" ? <NavAuthBar /> : <Navbar />}
            {props.children}
            <Foot />
        </div>
    );
};

export default Layout;
