import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import send_notify from "../../utils/toast";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function Protections() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [protections, setProtections] = useState([]);
    const [typeProtections, setTypeProtections] = useState([]);

    const fetchProtections = () => {
        let params = {};
        apiInst
            .get("/masking/protection/", { params })
            .then((resp) => {
                setProtections(resp.data.protections);
            })
            .catch((e) => console.log(e));
    };

    useEffect(() => {
        fetchProtections();
        apiInst
            .get("/masking/type-protection/")
            .then((resp) => {
                setTypeProtections(resp.data);
            })
            .catch((e) => console.log(e));
    }, []);

    const deleteClick = (event, key) => {
        let params = {
            rule_id: key,
        };
        console.log(params);
        apiInst
            .delete("/protection/", (params = params))
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchProtections();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const editClick = (value) => {
        console.log("edit el", value);
        apiInst
            .put("/masking/protection/", value)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchProtections();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const addClick = (value) => {
        console.log("value", value);
        let newProtection = {
            name: value.name,
        };
        console.log(newProtection);
        apiInst
            .post("/masking/protection/", newProtection)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchProtections();
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
                <div className="col-md d-flex header-list">
                    <AddElementButton
                        name={"Добавить защиту"}
                        type_form="protection"
                        types={typeProtections}
                        onSubmit={addClick}
                    ></AddElementButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Защиты</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    {protections == null ? (
                        <p>
                            <h2>Нет защит!</h2>
                        </p>
                    ) : (
                        <table>
                            <tr>
                                <th>Название защиты</th>
                                <th>Название АСУТП</th>
                                <th>Статус</th>
                                <th>Вход/Выход</th>
                                <th>Изменить</th>
                                <th>Удалить</th>
                            </tr>
                            {protections.map((protection) => (
                                <tr key={protection.id}>
                                    <td>{protection.name}</td>
                                    <td>{protection.type}</td>
                                    <td>{protection.status}</td>
                                    <td>
                                        {protection.is_end ? "Вход" : "Выход"}
                                    </td>
                                    <td className="td-btn">
                                        <AddElementButton
                                            type_form="protection"
                                            className="btn"
                                            onSubmit={editClick}
                                            name={"Изменить"}
                                            value={protection}
                                            types={typeProtections}
                                        ></AddElementButton>
                                    </td>
                                    <td className="td-btn">
                                        <button
                                            className="btn btn-danger"
                                            onClick={(el) =>
                                                deleteClick(el, protection.id)
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
