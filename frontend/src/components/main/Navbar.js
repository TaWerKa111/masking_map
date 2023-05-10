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
            <div className="row">
                <h1 className="text-center">
                    Экспертная система для формирования карт маскирования
                </h1>
            </div>
            <div className="row navbar">
                <div className="col ">
                    <a href="/" style={aStyle}>
                        <h2 className="navButton">Инструкция</h2>
                    </a>
                </div>
                <div className="col">
                    <a href="/masking-map/" style={aStyle}>
                        <h2 className="navButton">
                            Составить карту маскирования
                        </h2>
                    </a>
                </div>
                <div className="col">
                    <a href="/list-masking-map/" style={aStyle}>
                        <h2 className="navButton">
                            Посмотреть карты маскирования
                        </h2>
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
