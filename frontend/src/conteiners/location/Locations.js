import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function Locations() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [locations, setLocations] = useState({
        locations: [{ name: "name1", id: 1, type: 1 }],
    });
    const [typeLocations, setTypeLocations] = useState([
        { name: "type1", id: 1 },
    ]);
    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        console.log("loc", locations);
        // apiInst
        //     .get("/locations/", {params})
        //     .then((resp) => {
        //         setLocations(resp.data);
        //     })
        //     .catch(e => console.log(e));
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
                <div className="col-md d-flex">
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
                    <ul className="d-flex justify-content-center">
                        {locations == null ? (
                            <p>
                                <h2>Нет локаций!</h2>
                            </p>
                        ) : (
                            locations.locations.map((location) => (
                                <div
                                    key={location.id}
                                    className="itemOfQuestions"
                                >
                                    <p
                                        onClick={(el) =>
                                            onClick(el, location.id)
                                        }
                                    >
                                        {location.name}
                                    </p>
                                    {/* <button className="btn" onClick={el => editClick(el, location.id)}>Изменить</button> */}
                                    <AddElementButton
                                        is_edit={true}
                                        type_form="loc"
                                        className="btn"
                                        onSubmit={editClick}
                                        name={"Изменить"}
                                        types={typeLocations}
                                        value={location}
                                    ></AddElementButton>
                                    <button
                                        className="btn"
                                        onClick={(el) =>
                                            deleteClick(el, location.id)
                                        }
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
