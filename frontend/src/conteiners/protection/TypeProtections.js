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
                                                className="btn"
                                                onClick={(el) =>
                                                    deleteClick(el, typeProtection.id)
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
