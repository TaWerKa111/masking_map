import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";

export default function TypeLocations() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [typeLocations, setTypeLocations] = useState([
        { name: "type1", id: 1 },
    ]);
    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        apiInst
            .get("/masking/type-location/", { params })
            .then((resp) => {
                setTypeLocations(resp.data);
            })
            .catch((e) => console.log(e));
    }, []);

    const onClickDelete = (event, key) => {
        let params = {
            rule_id: key,
        };
        console.log(params);
        apiInst
            .delete("/locations/", (params = params))
            .then((resp) => alert(resp.result ? "Удалено" : "Не удалено"))
            .catch((e) => console.log(e));
    };

    const deleteClick = (event, key) => {
        console.log("delete el", key);
    };

    const editClick = (value) => {
        console.log("edit el", value);
        apiInst
            .post("/masking/type-location/", value)
            .catch((e) => console.log(e));
    };

    const addClick = (value) => {
        console.log("value", value);
        let type_location = {
            name: value.name,
        };
        console.log(type_location);
        apiInst
            .post("/masking/type-location/", type_location)
            .catch((e) => console.log(e));
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex header-list">
                    <AddElementButton
                        type_form="simple"
                        name={"Добавить тип локации"}
                        onSubmit={addClick}
                    ></AddElementButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Типы локаций</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    {typeLocations == null ? (
                            <p>
                                <h2>Нет типов локаций!</h2>
                            </p>
                        ) : (
                            <table>
                                <tr>
                                    <th>
                                        <p>Название</p>
                                    </th>
                                    <th>
                                        Изменить
                                    </th>
                                    <th>
                                        Удалить
                                    </th>
                                </tr>
                                {
                                    typeLocations.map((typeLocation) => (
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
                                    ))    
                                }
                            </table>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
