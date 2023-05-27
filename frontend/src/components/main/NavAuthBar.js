import { useEffect, useState } from "react";
import "../../style/main.css";
import { Dropdown } from "react-bootstrap";

const NavAuthBar = (props) => {
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
                <div className="col">
                    <a href="/expert/" style={aStyle} className="">
                        <h2 className="navButton">Инструкция</h2>
                    </a>
                </div>
                <div className="col">
                    <a href="/expert/rules/" style={aStyle}>
                        <h2 className="navButton">Правила</h2>
                    </a>
                </div>
                <div className="col navButton" style={aStyle}>
                    <Dropdown>
                        <Dropdown.Toggle
                            id="dropdown-basic"
                            className="btn btn-nav"
                        >
                            <h2
                                className="navButton"
                                style={{ display: "inline" }}
                            >
                                Справочники
                            </h2>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item href="/expert/type-works/">
                                Виды работ
                            </Dropdown.Item>
                            <Dropdown.Item href="/expert/dep/">
                                Отделы
                            </Dropdown.Item>
                            <Dropdown.Item href="/expert/locations/">
                                Места проведения работ
                            </Dropdown.Item>
                            <Dropdown.Item href="/expert/type-locations/">
                                Типы мест проведения работ
                            </Dropdown.Item>
                            <Dropdown.Item href="/expert/protections/">
                                Защиты
                            </Dropdown.Item>
                            <Dropdown.Item href="/expert/type-protections/">
                                Системы защит
                            </Dropdown.Item>
                            <Dropdown.Item href="/expert/questions/">
                                Список уточняющих вопросов
                            </Dropdown.Item>
                            <Dropdown.Item href="/expert/relationship-location-location/">
                                Связать места проведения работ и их составляющие
                            </Dropdown.Item>
                            <Dropdown.Item href="/expert/relationship-location-protection/">
                                Связать места проведения работ и их защиты
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                <div className="col">
                    <a href="/logout/" style={aStyle}>
                        <h2 className="navButton">Выйти</h2>
                    </a>
                </div>
                {/* <div className="col">
                    <h2 style={aStyle}>Профиль Эксперт.</h2>
                </div> */}
            </div>
        </div>
    );
};

export default NavAuthBar;
