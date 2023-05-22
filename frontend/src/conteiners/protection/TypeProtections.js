import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import send_notify from "../../utils/toast";

export default function TypeProtections() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [typeProtections, setTypeProtections] = useState([
        { name: "type1", id: 1 },
    ]);
    const navigate = useNavigate();

    function fetchTypeProtections() {
        let params = {
            limit: 100,
        };
        apiInst
            .get("/masking/type-protection/", { params: params })
            .then((resp) => {
                setTypeProtections(resp.data);
            })
            .catch((e) => console.log(e));
    }

    useEffect(() => {
        fetchTypeProtections();
    }, []);

    const deleteClick = (event, key) => {
        console.log("delete el", key);
        let params = {
            rule_id: key,
        };
        console.log(params);
        apiInst
            .delete("/locations/", (params = params))
            .then((resp) => alert(resp.data.result ? "Удалено" : "Не удалено"))
            .catch((e) => console.log(e));
    };

    const editClick = (value) => {
        console.log("value", value);
        let new_value = {
            id: value.id,
            name: value.name,
        };
        apiInst
            .put("/masking/type-protection/", new_value)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchTypeProtections();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e);
            });
        fetchTypeProtections();
    };

    const addClick = (value) => {
        console.log("value", value);
        let type_protection = {
            name: value.name,
        };
        console.log(type_protection);
        apiInst
            .post("/masking/type-protection/", type_protection)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchTypeProtections();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e);
            });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex header-list">
                    <AddElementButton
                        type_form="simple"
                        name={"Добавить систему защиты"}
                        onSubmit={addClick}
                    ></AddElementButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Типы защит</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    {typeProtections == null ? (
                        <p>
                            <h2>Нет типов защит!</h2>
                        </p>
                    ) : (
                        <table>
                            <tr>
                                <th>Название</th>
                                <th>Изменить</th>
                                <th>Удалить</th>
                            </tr>
                            {typeProtections.map((typeProtection) => (
                                <tr key={typeProtection.id}>
                                    <td>{typeProtection.name}</td>
                                    <td className="td-btn">
                                        <AddElementButton
                                            type_form="simple"
                                            className="btn"
                                            onSubmit={editClick}
                                            name={"Изменить"}
                                            value={typeProtection}
                                        ></AddElementButton>
                                    </td>
                                    <td className="td-btn">
                                        <button
                                            className="btn btn-danger"
                                            onClick={(el) =>
                                                deleteClick(
                                                    el,
                                                    typeProtection.id
                                                )
                                            }
                                        >
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
