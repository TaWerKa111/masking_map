import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import FilterButton from "../forms/FilterForm";
import send_notify from "../../utils/toast";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function Locations() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [locations, setLocations] = useState([
        { name: "name1", id: 1, type: 1 },
    ]);
    const [typeLocations, setTypeLocations] = useState([
        { name: "type1", id: 1 },
    ]);
    const [optionTypeLocations, setOptionTypeLocations] = useState([]);

    const fetchLocation = () => {
        let params = {};
        apiInst
            .get("/masking/location-list/", { params: params })
            .then((resp) => {
                setLocations(resp.data.locations);
            })
            .catch((e) => console.log(e));
    };

    useEffect(() => {
        fetchLocation();
        apiInst
            .get("/masking/type-location/")
            .then((resp) => {
                setTypeLocations(resp.data);
            })
            .catch((e) => console.log(e));

        setOptionTypeLocations(
            typeLocations.map((type) => {
                return { value: type.name, label: type.id };
            })
        );
    }, []);

    const deleteClick = (event, key) => {
        console.log("delete el", key);
        let params = {
            rule_id: key,
        };
        console.log(params);
        apiInst
            .delete("/location/", (params = params))
            .then((resp) => alert(resp.result ? "Удалено" : "Не удалено"))
            .catch((e) => console.log(e));
    };

    const editClick = (value) => {
        console.log("edit el", value);
        apiInst
            .put("/masking/location/", value)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchLocation();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const addClick = (value) => {
        console.log("add value", value);
        let newLocation = {
            name: value.name,
        };
        console.log(newLocation);
        apiInst
            .post("/masking/location/", newLocation)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchLocation();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const handleFiltered = (params) => {
        console.log("params", params);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex header-list">
                    <AddElementButton
                        type_form="loc"
                        name="Добавить локацию"
                        onSubmit={addClick}
                        types={typeLocations}
                    ></AddElementButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Места проведения работ</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <FilterButton
                    optionTypeLocations={optionTypeLocations}
                    onClickFiltered={handleFiltered}
                ></FilterButton>
            </div>
            <div className="row">
                <div className="col-md">
                    {locations == null ? (
                        <p>
                            <h2>Нет локаций!</h2>
                        </p>
                    ) : (
                        <table>
                            <tr>
                                <th>Название места проведения работ</th>
                                <th>Тип локации</th>
                                <th>Защиты</th>
                                <th>Изменить</th>
                                <th>Удалить</th>
                            </tr>
                            {locations.map((location) => (
                                <tr key={location.id}>
                                    <td>{location.name}</td>
                                    <td>{location.type}</td>
                                    <td>{location.protection}</td>
                                    <td className="td-btn">
                                        <AddElementButton
                                            is_edit={true}
                                            type_form="loc"
                                            className="btn"
                                            onSubmit={editClick}
                                            name={"Изменить"}
                                            types={typeLocations}
                                            value={location}
                                        ></AddElementButton>
                                    </td>
                                    <td className="td-btn">
                                        <button
                                            className="btn btn-danger"
                                            onClick={(el) =>
                                                deleteClick(el, location.id)
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
