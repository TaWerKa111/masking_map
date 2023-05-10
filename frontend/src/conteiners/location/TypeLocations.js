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
        console.log("loc", typeLocations);
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
                        type_form="simple"
                        name={"Добавить тип локации"}
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
                    <ul className="d-flex justify-content-center">
                        {typeLocations == null ? (
                            <p>
                                <h2>Нет типов локаций!</h2>
                            </p>
                        ) : (
                            typeLocations.map((typeLocation) => (
                                <div
                                    key={typeLocation.id}
                                    className="itemOfQuestions"
                                >
                                    <p>{typeLocation.name}</p>
                                    <AddElementButton
                                        type_form="simple"
                                        className="btn"
                                        onSubmit={editClick}
                                        name={"Изменить"}
                                        value={typeLocation.name}
                                    ></AddElementButton>
                                    <button
                                        className="btn"
                                        onClick={(el) =>
                                            deleteClick(el, typeLocation.id)
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
