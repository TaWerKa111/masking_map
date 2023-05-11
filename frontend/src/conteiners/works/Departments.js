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

    const fetchDepartamentsData = (params=null) => {
        apiInst
            .get("/masking/departament-type-work/", { params })
            .then((resp) => {
                setDepartments(resp.data.departaments);
            })
            .catch((e) => console.log(e));
    }

    useEffect(() => {
        let params = {};
        fetchDepartamentsData();
    }, []);

    const deleteClick = (event, key) => {
        console.log("delete el", key);
    };

    const editClick = (value) => {
        console.log("value", value);
        apiInst
            .put("/masking/departament-type-work/", value)
            .catch((e) => console.log(e));
        fetchDepartamentsData();
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
        fetchDepartamentsData();
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
                    <ul className="">
                        {departments == null ? (
                            <p>
                                <h2>Нет отделов!</h2>
                            </p>
                        ) : (
                            departments.map((department) => (
                                <div
                                    key={department.id}
                                    className="itemOfQuestions d-flex"
                                >
                                    <p>{department.name}</p>
                                    <div className="btn-manage-el">
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
                                    
                                </div>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
