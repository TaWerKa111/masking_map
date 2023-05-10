import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function Protections() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [protections, setProtections] = useState([
        { name: "pro1", id: 1, type: 1, is_end: true },
    ]);
    const [typeProtections, setTypeProtections] = useState([
        { name: "type1", id: 1 },
    ]);
    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        apiInst
            .get("/protections/", { params })
            .then((resp) => {
                setProtections(resp.data);
            })
            .catch((e) => console.log(e));
    }, []);

    const onClickDelete = (event, key) => {
        let params = {
            rule_id: key,
        };
        console.log(params);
        apiInst
            .delete("/protections/", (params = params))
            .then((resp) => alert(resp.result ? "Удалено" : "Не удалено"))
            .catch((e) => console.log(e));
    };

    const onClick = (event, key) => {
        let params = {
            rule_id: key,
        };
        console.log(params);
        navigate({
            pathname: `/protections/`,
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
                        name={"Добавить защиту"}
                        type_form="protection"
                        types={typeProtections}
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
                    <ul className="d-flex justify-content-center">
                        {protections == null ? (
                            <p>
                                <h2>Нет защит!</h2>
                            </p>
                        ) : (
                            protections.map((protection) => (
                                <div
                                    key={protection.id}
                                    className="itemOfQuestions"
                                >
                                    <p>{protection.name}</p>
                                    <AddElementButton
                                        type_form="protection"
                                        className="btn"
                                        onSubmit={editClick}
                                        name={"Изменить"}
                                        value={protection}
                                        types={typeProtections}
                                    ></AddElementButton>
                                    <button
                                        className="btn"
                                        onClick={(el) =>
                                            deleteClick(el, protection.id)
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
