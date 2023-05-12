import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import FilterButton from "../forms/FilterForm";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function Locations() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [locations, setLocations] = useState(
        [{ name: "name1", id: 1, type: 1 }],
    );
    const [typeLocations, setTypeLocations] = useState([
        { name: "type1", id: 1 },
    ]);
    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        console.log("loc", locations);
        apiInst
            .get("/masking/location-list/", { params })
            .then((resp) => {
                setLocations(resp.data.locations);
            })
            .catch((e) => console.log(e));
        apiInst
            .get("/masking/type-location/")
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

    const onClick = (event, key) => {
        let params = {
            rule_id: key,
        };
        console.log(params);
        navigate({
            pathname: `/locations/`,
            search: `?${createSearchParams(params)}`,
        });
    };

    const deleteClick = (event, key) => {
        console.log("delete el", key);
    };
    const editClick = (value) => {
        console.log("edit el", value);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex header-list">
                    <AddElementButton
                        type_form="loc"
                        name="Добавить локацию"
                        types={typeLocations}
                    ></AddElementButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Локации</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <FilterButton>
                    </FilterButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    {
                        locations == null ? (
                                <p>
                                    <h2>Нет локаций!</h2>
                                </p>
                            ) : (
                                <table>
                                    <tr>
                                        <th>
                                            Название
                                        </th>
                                        <th>
                                            Тип локации
                                        </th>
                                        <th>
                                            Защиты
                                        </th>
                                        <th>
                                            Изменить
                                        </th>
                                        <th>
                                            Удалить
                                        </th>
                                    </tr>
                                    {
                                        locations.map((location) => (
                                            <tr key={location.id}>
                                                <td>
                                                    {location.name}
                                                </td>
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
