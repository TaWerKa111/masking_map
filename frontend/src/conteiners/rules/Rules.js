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

export default function Rules() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rules, setRules] = useState(null);
    const [typeWorks, setTypeWorks] = useState([]);
    const [typeLocations, setTypeLocations] = useState([]);
    const [protections, setProtections] = useState([]);
    const navigate = useNavigate();

    const fetchRules = () => {
        let params = {};
        apiInst
            .get("/rule/rules/", { params })
            .then((resp) => {
                setRules(resp.data.rules);
            })
            .catch((e) => console.log(e));
    };

    useEffect(() => {
        fetchRules();
        apiInst
            .get("/masking/type-work/")
            .then((resp) => {
                setTypeWorks(resp.data.type_works);
            })
            .catch((e) => console.log(e));
        apiInst
            .get("/masking/protection/")
            .then((resp) => {
                setProtections(resp.data.protections);
            })
            .catch((e) => console.log(e));
        apiInst
            .get("/masking/type-location/")
            .then((resp) => {
                setTypeLocations(resp.data);
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
        const result = window.confirm(
            "Вы уверены, что хотите удалить правило?"
        );
        if (result) {
            console.log("delete el", key);
            let params = {
                rule_id: key,
            };
            console.log(params);
            apiInst
                .delete("/rule/rule/", { params })
                .then((resp) => {
                    if (resp.data.result) {
                        send_notify(resp.data.message, "success");
                        fetchRules();
                    } else send_notify(resp.data.message, "error");
                })
                .catch((e) => {
                    send_notify(e.response.data.message, "error");
                    console.log(e.response.data.message);
                });
            fetchRules();
        }
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
                // state: { rule_id: key },
            });
        } else navigate("/expert/add-rule/");
    };
    console.log("rules", rules);

    const handleFiltered = (params) => {
        console.log("fitering type-works...", params);
        apiInst
            .get("/rule/rules/", { params })
            .then((resp) => {
                setRules(resp.data.rules);
                send_notify(
                    "Список отфильтрован." +
                        `\nНайдено правил: ${resp.data.pagination.total_items}`,
                    "success"
                );
            })
            .catch((e) => {
                console.log(e);
            });
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md header-list">
                    <button
                        onClick={editClick}
                        className="btn btn-primary btn-blue"
                    >
                        Добавить правило
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2 className="center-header header-block">Правила</h2>
                    </p>
                </div>
            </div>
            <FilterButton
                onClickFiltered={handleFiltered}
                name="rules"
                typeLocations={typeLocations}
                protections={protections}
                typeWorks={typeWorks}
            ></FilterButton>
            <div className="row">
                <div className="col-md">
                    {!rules ? (
                        <p>
                            <h2>Нет правил!</h2>
                        </p>
                    ) : (
                        <table className="table-rule">
                            <tr className="text-center">
                                <th className="td-ind">Номер правила</th>
                                <th>Виды работ</th>
                                <th>Критерии</th>
                                <th>Защиты</th>
                                <th>Сопровождающие мероприятия</th>
                                <th>Действия</th>
                            </tr>
                            {rules.map((rule) => (
                                <tr>
                                    <td className="td-ind text-center">
                                        {rule.id}
                                    </td>
                                    <td>
                                        <ul>
                                            {rule.criteria
                                                .find(
                                                    (item) =>
                                                        item.type_criteria ===
                                                        "type_work"
                                                )
                                                .type_works.map((item) => (
                                                    <li>{item.name}</li>
                                                ))}
                                        </ul>
                                    </td>
                                    <td>
                                        <label>Места проведения работ</label>
                                        <ul>
                                            {rule.criteria.find(
                                                (item) =>
                                                    item.type_criteria ===
                                                    "location"
                                            ).locations.length > 0
                                                ? rule.criteria
                                                      .find(
                                                          (item) =>
                                                              item.type_criteria ===
                                                              "location"
                                                      )
                                                      .locations.map((item) => (
                                                          <li>{item.name}</li>
                                                      ))
                                                : "Не задано"}
                                        </ul>
                                        <label>Типы локаций</label>
                                        <ul>
                                            {rule.criteria.find(
                                                (item) =>
                                                    item.type_criteria ===
                                                    "type_location"
                                            ).locations_type.length > 0
                                                ? rule.criteria
                                                      .find(
                                                          (item) =>
                                                              item.type_criteria ===
                                                              "type_location"
                                                      )
                                                      .locations_type.map(
                                                          (item) => (
                                                              <li>
                                                                  {item.name}
                                                              </li>
                                                          )
                                                      )
                                                : "Не задано"}
                                        </ul>
                                        <label>Условия</label>
                                        <ul>
                                            {rule.criteria.find(
                                                (item) =>
                                                    item.type_criteria ===
                                                    "question"
                                            ).questions.length > 0
                                                ? rule.criteria
                                                      .find(
                                                          (item) =>
                                                              item.type_criteria ===
                                                              "question"
                                                      )
                                                      .questions.map((item) => (
                                                          <li>{item.text}</li>
                                                      ))
                                                : "Не задано"}
                                        </ul>
                                    </td>
                                    <td className="td-info">
                                        <ul>
                                            {rule.protections.map((item) => (
                                                <li>{item.name}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="td-info">
                                        {rule.compensatory_measures}
                                    </td>
                                    <td className="td-action-rule">
                                        <button
                                            className="btn btn-primary btn-action-rule btn-blue"
                                            onClick={(el) =>
                                                editClick(el, rule.id)
                                            }
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            className="btn btn-danger btn-action-rule btn-red"
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
