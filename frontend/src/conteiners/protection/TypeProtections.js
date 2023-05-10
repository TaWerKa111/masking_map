import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";

export default function TypeProtections() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [typeProtections, setTypeProtections] = useState([
        { name: "type1", id: 1 },
    ]);
    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        apiInst
            .get("/masking/type-protection/", { params })
            .then((resp) => {
                setTypeProtections(resp.data);
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
        console.log("value", value);
        apiInst
            .put("/masking/type-protection/", value)
            .catch((e) => console.log(e));
    };

    const addClick = (value) => {
        console.log("value", value);
        let type_protection = {
            name: value.name,
        };
        console.log(type_protection);
        apiInst
            .post("/masking/type-protection/", type_protection)
            .catch((e) => console.log(e));
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex header-list">
                    <AddElementButton
                        type_form="simple"
                        name={"Добавить тип защиты"}
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
                    <ul className="d-flex justify-content-center">
                        {typeProtections == null ? (
                            <p>
                                <h2>Нет типов защит!</h2>
                            </p>
                        ) : (
                            typeProtections.map((typeProtection) => (
                                <div
                                    key={typeProtection.id}
                                    className="itemOfQuestions"
                                >
                                    <p>{typeProtection.name}</p>
                                    <AddElementButton
                                        type_form="simple"
                                        className="btn"
                                        onSubmit={editClick}
                                        name={"Изменить"}
                                        value={typeProtection}
                                    ></AddElementButton>
                                    <button
                                        className="btn"
                                        onClick={(el) =>
                                            deleteClick(el, typeProtection.id)
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
