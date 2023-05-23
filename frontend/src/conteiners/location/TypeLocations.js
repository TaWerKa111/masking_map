import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import send_notify from "../../utils/toast";

export default function TypeLocations() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [typeLocations, setTypeLocations] = useState([
        { name: "type1", id: 1 },
    ]);
    const navigate = useNavigate();

    function fetchTypeLocations() {
        let params = {
            limit: 10,
        };
        apiInst
            .get("/masking/type-location/", { params: params })
            .then((resp) => {
                setTypeLocations(resp.data);
            })
            .catch((e) => console.log(e));
    }

    useEffect(() => {
        fetchTypeLocations();
    }, []);

    const deleteClick = (event, key) => {
        console.log("delete el", key);
        let params = {
            type_location_id: key,
        };
        console.log(params);
        apiInst
            .delete("/masking/type-location/", { params })
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
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
            .put("/masking/type-location/", value)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchTypeLocations();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => send_notify(e.response.data.message, "error"));
    };

    const addClick = (value) => {
        console.log("value", value);
        let type_location = {
            name: value.name,
        };
        console.log(type_location);
        apiInst
            .post("/masking/type-location/", type_location)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchTypeLocations();
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
                        type_form="simple"
                        name={"Добавить тип места проведения работ"}
                        onSubmit={addClick}
                    ></AddElementButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Типы мест проведения работ</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    {typeLocations == null ? (
                        <p>
                            <h2>Нет типов мест проведения работ!</h2>
                        </p>
                    ) : (
                        <table>
                            <tr>
                                <th>
                                    <p>Название</p>
                                </th>
                                <th>Изменить</th>
                                <th>Удалить</th>
                            </tr>
                            {typeLocations.map((typeLocation) => (
                                <tr key={typeLocation.id}>
                                    <td>
                                        <p>{typeLocation.name}</p>
                                    </td>
                                    <td className="td-btn">
                                        <AddElementButton
                                            type_form="simple"
                                            className="btn"
                                            onSubmit={editClick}
                                            name={"Изменить"}
                                            value={typeLocation}
                                        ></AddElementButton>
                                    </td>
                                    <td className="td-btn">
                                        <button
                                            className="btn btn-danger"
                                            onClick={(el) =>
                                                deleteClick(el, typeLocation.id)
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
