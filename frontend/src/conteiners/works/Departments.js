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

    const fetchDepartamentsData = (params = null) => {
        apiInst
            .get("/masking/departament-type-work/", { params })
            .then((resp) => {
                setDepartments(resp.data.departaments);
            })
            .catch((e) => console.log(e));
    };

    useEffect(() => {
        let params = {};
        fetchDepartamentsData();
    }, []);

    const deleteClick = (event, key) => {
        console.log("delete el", key);
        let params = {
            dep_id: key,
        };
        console.log(params);
        apiInst
            .delete("/masking/departament-type-work/", { params })
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchDepartamentsData();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const editClick = (value) => {
        console.log("value", value);
        apiInst
            .put("/masking/departament-type-work/", value)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchDepartamentsData();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const addClick = (value) => {
        console.log("value", value);
        let departament = {
            name: value.name,
        };
        console.log(departament);
        apiInst
            .post("/masking/departament-type-work/", departament)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchDepartamentsData();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md header-list">
                    <AddElementButton
                        name={"Добавить отдел"}
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
                    {departments == null ? (
                        <p>
                            <h2>Нет отделов!</h2>
                        </p>
                    ) : (
                        <table>
                            <tr>
                                <th>Название отдела</th>
                                <th>Изменить</th>
                                <th>Удалить</th>
                            </tr>
                            {departments.map((department) => (
                                <tr key={department.id}>
                                    <td>{department.name}</td>
                                    <td className="td-btn">
                                        <AddElementButton
                                            type_form="simple"
                                            className="btn"
                                            onSubmit={editClick}
                                            name={"Изменить"}
                                            value={department}
                                        ></AddElementButton>
                                    </td>
                                    <td className="td-btn">
                                        <button onClick={e => deleteClick(e, department.id)} className="btn btn-danger">
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
