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
        if (key) {
            let params = {
                rule_id: key,
            };
            navigate({
                pathname: `/expert/add-rule/`,
                search: `?${createSearchParams(params)}`,
                state: { rule_id: key },
            });
        }
        navigate("/expert/add-rule/");
    };
    console.log("rules", rules);

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md d-flex header-list">
                    <button onClick={editClick} className="btn btn-primary">
                        Добавить правило
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
            <FilterButton
                // onClickFiltered={handleFiltered}
                name="rules"
                // departaments={departments}
            ></FilterButton>
            <div className="row">
                <div className="col-md">
                        {!rules ? (
                            <p>
                                <h2>Нет правил!</h2>
                            </p>
                        ) : (
                            <table className="table-rule">
                                <tr>
                                    {/* <th>Название Правила</th> */}
                                    <th className="td-ind">Номер правила</th>
                                    <th>Виды работ</th>
                                    <th>Критерии</th>
                                    {/* <th>Типы мест проведения работ</th>
                                    <th>Условия</th> */}
                                    <th>Защиты</th>
                                    <th>Сопровождающие мероприятия</th>
                                    {/* <th>Изменить</th> */}
                                    <th>Действия</th>
                                </tr>
                                {rules.map((rule) => (
                                    <tr>
                                        <td className="td-ind text-center">{rule.id}</td>
                                        <td>
                                            {rule.criteria
                                                .find(
                                                    (item) =>
                                                        item.type_criteria ===
                                                        "type_work"
                                                )
                                                .works.map((item) => item.name)}
                                        </td>
                                        <td>
                                            <label>Места проведения работ</label>
                                            <ul>
                                                {rule.criteria
                                                    .find(
                                                        (item) =>
                                                            item.type_criteria ===
                                                            "location"
                                                )
                                                    .locations.map(
                                                        (item) => <li>{item.name}</li>
                                                )}
                                            </ul>
                                            <label>Типы локаций</label>
                                            <ul>
                                            {rule.criteria
                                                .find(
                                                    (item) =>
                                                        item.type_criteria ===
                                                        "type_location"
                                                )
                                                .locations_type.map(
                                                    (item) => <li>{item.name}</li>
                                                )}
                                            </ul>
                                            <label>Условия</label>
                                            <ul>
                                            {rule.criteria
                                                .find(
                                                    (item) =>
                                                        item.type_criteria ===
                                                        "question"
                                                )
                                                .questions.map(
                                                    (item) => <li>{item.name}</li>
                                                )}
                                            </ul>
                                        </td>
                                        {/* <td>
                                            {rule.criteria
                                                .find(
                                                    (item) =>
                                                        item.type_criteria ===
                                                        "location"
                                                )
                                                .locations.map(
                                                    (item) => item.name
                                                )}
                                        </td>
                                        <td>
                                            {rule.criteria
                                                .find(
                                                    (item) =>
                                                        item.type_criteria ===
                                                        "type_location"
                                                )
                                                .locations_type.map(
                                                    (item) => item.name
                                                )}
                                        </td>
                                        <td>
                                            {rule.criteria
                                                .find(
                                                    (item) =>
                                                        item.type_criteria ===
                                                        "question"
                                                )
                                                .questions.map(
                                                    (item) => item.name
                                                )}
                                        </td> */}
                                        <td className="td-info">
                                            {rule.protections.map(
                                                (item) => item.name
                                            )}
                                        </td>
                                        <td className="td-info">{rule.compensatory_measures}</td>
                                        {/* <td>
                                            <button
                                                className="btn btn-primary"
                                                onClick={(el) =>
                                                    editClick(el, rule.id)
                                                }
                                            >
                                                Изменить
                                            </button>
                                        </td> */}
                                        <td className="td-action-rule">
                                        <button
                                                className="btn btn-primary btn-action-rule"
                                                onClick={(el) =>
                                                    editClick(el, rule.id)
                                                }
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                className="btn btn-danger btn-action-rule"
                                                onClick={(el) =>
                                                    deleteClick(el, rule.id)
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
