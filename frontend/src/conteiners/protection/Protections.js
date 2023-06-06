import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import send_notify from "../../utils/toast";
import FilterButton from "../forms/FilterForm";
import LoadingSpinner from "../../components/main/LoadingSpinner";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function Protections() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [protections, setProtections] = useState([]);
    const [typeProtections, setTypeProtections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProtections = () => {
        let params = {
            limit: 100,
        };
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
                setIsLoading(false);
            })
            .catch((e) => console.log(e));
    }, []);

    const deleteClick = (event, key) => {
        let params = {
            protection_id: key,
        };
        console.log(params);
        apiInst
            .delete("/masking/protection/", { params })
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
        let newProtection = {
            id: value.id,
            name: value.name,
            is_end: value.is_end,
            id_type_protection: parseInt(value.type),
        };
        apiInst
            .put("/masking/protection/", newProtection)
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
            is_end: value.is_end,
            id_type_protection: value.type,
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

    const handleFiltered = (params) => {
        console.log("params", params);
        apiInst
            .get(`/masking/protection/`, { params })
            .then((resp) => {
                setProtections(resp.data.protections);
            })
            .catch((e) => {
                console.log(e);
                send_notify(e.response.data.message, "error");
            });
    };

    return isLoading ? (
        <LoadingSpinner></LoadingSpinner>
    ) : (
        <div className="container">
            <div className="row">
                <div className="col-md header-list">
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
                        <h1 className="center-header header-block">Защиты</h1>
                    </p>
                </div>
            </div>
            <FilterButton
                typeProtections={typeProtections}
                onClickFiltered={handleFiltered}
                name="protections"
            ></FilterButton>
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
                                    <td>
                                        {protection.id_type_protection
                                            ? typeProtections.find(
                                                  (item) =>
                                                      item.id ===
                                                      protection.id_type_protection
                                              ).name
                                            : "Отсутсвует"}
                                    </td>
                                    <td>{protection.status}</td>
                                    <td>
                                        {protection.is_end ? "Выход" : "Вход"}
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
                                            className="btn btn-danger btn-red"
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
