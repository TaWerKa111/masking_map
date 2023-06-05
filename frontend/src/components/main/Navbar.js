import { useEffect, useState } from "react";
import "../../style/main.css";
import { Dropdown } from "react-bootstrap";

const Navbar = (props) => {
    const divStyle = {
        color: "#FFF",
        backgroundColor: "#1B527C",
    };

    const aStyle = {
        textDecoration: "none",
        color: "#FFF",
    };

    return (
        <div className="container-fluid" style={divStyle}>
            <div className="row row-system">
                <h1 className="name-system text-center">
                    Экспертная система для формирования карт маскирования
                </h1>
            </div>
            <div className="row navbar navbar-noauth">
                <div className="col ">
                    <a href="/" style={aStyle}>
                        <h2 className="navButton">Инструкция</h2>
                    </a>
                </div>
                <div className="col">
                    <a href="/masking-map-v2/" style={aStyle}>
                        <h2 className="navButton">Составить карту</h2>
                    </a>
                </div>
                <div className="col">
                    <a href="/list-masking-map/" style={aStyle}>
                        <h2 className="navButton">Посмотреть карты</h2>
                    </a>
                </div>
                <div className="col">
                    <a href="/login/" style={aStyle}>
                        <h2 className="navButton">Войти</h2>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
