import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function Rules() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rules, setRules] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        apiInst
            .get("/rule/rules/", { params })
            .then((resp) => {
                setRules(resp.data.rules);
            })
            .catch((e) => console.log(e));
    }, []);

    const onClick = (event, key) => {
        let params = {
            rule_id: key,
        };
        console.log(params);
        navigate({
            pathname: `/expert/rule/`,
            search: `?${createSearchParams(params)}`,
        });
    };

    const deleteClick = (event, key) => {
        console.log("delete el", key);
        let params = {
            rule_id: key,
        };
        console.log(params);
        apiInst
            .delete("/rule/", (params = params))
            .then((resp) => alert(resp.result ? "Удалено" : "Не удалено"))
            .catch((e) => console.log(e));
    };

    const editClick = (event, key) => {
        console.log("edit el", key);
        let params = {
            rule_id: key,
        };
        navigate({
            pathname: `/expert/add-rule/`,
            search: `?${createSearchParams(params)}`,
            state: { rule_id: key },
        });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex header-list">
                    <button className="btn btn-primary">
                        <a href="/expert/add-rule/" color="black">
                            Добавить правило
                        </a>
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Правила</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <ul className="d-flex justify-content-center">
                        {rules == null ? (
                            <p>
                                <h2>Нет правил!</h2>
                            </p>
                        ) : (
                            rules.rules.map((rule) => (
                                <table>
                                    <tr>
                                        <th>Название Правила</th>
                                        <th>Виды работ</th>
                                        <th>Места проведения работ</th>
                                        <th>Защиты</th>
                                        <th>Компенсирующие мероприятия</th>
                                        <th>Изменить</th>
                                        <th>Удалить</th>
                                    </tr>
                                    <tr>
                                        <td>{rule.name}</td>
                                        <td>{rule}</td>
                                        <td>{rule}</td>
                                        <td>{rule}</td>
                                        <td>
                                            <button
                                                className="btn"
                                                onClick={(el) =>
                                                    editClick(el, rule.id)
                                                }
                                            >
                                                Изменить
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn"
                                                onClick={(el) =>
                                                    deleteClick(el, rule.id)
                                                }
                                            >
                                                Удалить
                                            </button>
                                        </td>
                                    </tr>
                                </table>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
