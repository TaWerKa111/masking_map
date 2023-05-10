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

    useEffect(() => {
        let params = {};
        apiInst
            .get("/masking/departament-type-work/", { params })
            .then((resp) => {
                setDepartments(resp.data);
            })
            .catch((e) => console.log(e));
    }, []);

    const deleteClick = (event, key) => {
        console.log("delete el", key);
    };

    const editClick = (value) => {
        console.log("value", value);
        apiInst
            .put("/masking/departament-type-work/", value)
            .catch((e) => console.log(e));
    };

    const addClick = (value) => {
        console.log("value", value);
        let departament = {
            name: value.name,
        };
        console.log(departament);
        apiInst
            .post("/masking/departament-type-work/", departament)
            .catch((e) => console.log(e));
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex header-list">
                    <AddElementButton
                        name={"Добавить тип отдел"}
                        type_form="simple"
                        onSubmit={addClick}
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
                                        value={department}
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
