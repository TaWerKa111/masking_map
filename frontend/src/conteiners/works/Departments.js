import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import { ToastContainer, toast } from "react-toastify";
import send_notify from "../../utils/toast";


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
            .catch((e) => {
                send_notify("Ошибка при добавлении отдела", "error");
            }
        );
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
                {departments == null? (
                            <p>
                                <h2>Нет отделов!</h2>
                            </p>
                    ):(
                    <table>
                        <tr>
                            <th>
                                Название
                            </th>
                            <th>
                                Виды работ
                            </th>
                            <th>Изменить</th>
                            <th>Удалить</th>
                        </tr>
                        {
                            departments.map((department) => (
                                <tr key={department.id}>
                                    <td>{department.name}</td>
                                    <td>{department.type_work}</td>
                                    <td className="td-btn"><button className="btn btn-primary">Изменить</button></td>
                                    <td className="td-btn"><button className="btn btn-danger">Удалить</button></td>
                                </tr>
                            ))
                        }
                    </table> 
                    )}
                </div>
            </div>

        </div>
    );
}
