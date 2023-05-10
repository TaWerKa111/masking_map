import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";

export default function Departments() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [departments, setDepartments] = useState([{ name: "type1", id: 1 }]);
    const navigate = useNavigate();

    const deleteClick = (event, key) => {
        console.log("delete el", key);
    };
    const editClick = (value) => {
        console.log("edit el", value);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex">
                    <AddElementButton
                        name={"Добавить тип отдел"}
                        type_form="simple"
                    ></AddElementButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Отделы</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <ul className="d-flex justify-content-center">
                        {departments == null ? (
                            <p>
                                <h2>Нет отделов!</h2>
                            </p>
                        ) : (
                            departments.map((department) => (
                                <div
                                    key={department.id}
                                    className="itemOfQuestions"
                                >
                                    <p>{department.name}</p>
                                    <AddElementButton
                                        type_form="simple"
                                        className="btn"
                                        onSubmit={editClick}
                                        name={"Изменить"}
                                        value={department.name}
                                    ></AddElementButton>
                                    <button
                                        className="btn"
                                        onClick={(el) =>
                                            deleteClick(el, department.id)
                                        }
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
