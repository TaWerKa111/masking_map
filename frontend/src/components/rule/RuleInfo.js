import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
// import Modal from "../modal/ModalTypeWork";
import ModalTypeWork from "../modal/ModalTypeWork";
import ModalChoiceProtections from "../modal/Protections";
import ModalLocation from "../modal/ModalLocation";
import CheckboxProtection from "../checkbox/CheckBoxProtection";
import ModalQuestions from "../modal/ModalQuestions";
import Select from "react-select";
import send_notify from "../../utils/toast";
import ModalChangeValue from "../modal/ModalChangeValue";

const TYPES_CRITERIA_OPTIONS = [
    { value: "type_work", label: "Виды работы" },
    { value: "location", label: "Места проведения работ" },
    { value: "type_location", label: "Типы мест проведения работ" },
    { value: "question", label: "Вопросы" },
];

export default function RuleInfo(props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rule, setRule] = useState(props.rule);
    const [typeOptionLocations, setOptionTypeLocations] = useState([
        { name: "asd", id: 1 },
        { name: "asd", id: 2 },
    ]);
    const [selectedTypeLocations, setSelectedTypeLocations] = useState(
        rule.type_locations
    );
    const [isModalTypeWork, setIsModalTypeWork] = useState(false);
    const [isModal, setModal] = useState(false);
    const [isModalLocation, setModalLocation] = useState(false);
    const [isModalProtection, setModalProtection] = useState(false);
    const [isModalCondition, setModalCondition] = useState(false);
    const [protections, setProtections] = useState(rule.protections);
    const [selectedTypeCriteria, setSelectedTypeCriteria] = useState({});
    const [criteriaList, setCriteriaList] = useState(
        props.rule.criteria ? props.rule.criteria : []
    );
    const [selectedCriteriaEditindId, setSelectedCriteriaEditindId] =
        useState(null);
    const [isConfirmationOpen, setConfirmationOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        apiInst
            .get("/masking/type-location/", { params: {} })
            .then((resp) => {
                setOptionTypeLocations(
                    resp.data.map((type) => {
                        return { value: type.id, label: type.name };
                    })
                );
            })
            .catch((e) => console.log(e));
    }, []);

    const handleChange = (event) => {
        let temp_value = Object.assign({}, rule);
        temp_value[event.target.name] = event.target.value;
        console.log("temp", temp_value);
        setRule(temp_value);
        console.log("temp", event.target.value);
    };

    const handleTypeWorks = (typeWorks) => {
        console.log("type_works", typeWorks);
        setModal(false);
        // let temp = Object.assign({}, rule);
        // temp["works"] = typeWorks;
        setCriteriaList(
            criteriaList.map((cr) => {
                if (cr.id === selectedCriteriaEditindId) {
                    return { ...cr, type_works: typeWorks };
                } else return cr;
            })
        );
    };

    const handleLocations = (locations) => {
        console.log("locations add", locations);
        setModalLocation(false);
        setCriteriaList(
            criteriaList.map((cr) => {
                if (cr.id === selectedCriteriaEditindId) {
                    return {
                        ...cr,
                        locations: locations.map((item) => ({
                            id: item.value,
                            name: item.label,
                        })),
                    };
                } else return cr;
            })
        );
    };

    const handleProtections = (protections) => {
        console.log("protections", protections);
        setModalProtection(false);
        setProtections(protections);
        let temp = Object.assign({}, rule);
        temp["protections"] = protections;
        setRule(temp);
    };

    const handleCheckboxChange = (id, field, isChecked) => {
        console.log("id", id);
        console.log("field", field);
        console.log("isChecked", isChecked);
        let newProtections = protections.map((type) => {
            if (type.id == id) {
                return {
                    ...type,
                    [field]: isChecked,
                };
            } else {
                return type;
            }
        });
        setProtections(newProtections);
        let temp = Object.assign({}, rule);
        temp["protections"] = newProtections;
        setRule(temp);
    };

    const handleConditions = (conditions) => {
        console.log("conditions", conditions);
        setModalCondition(false);
        // let temp = Object.assign({}, rule);
        // temp["conditions"] = conditions.map((condition) => {
        //     return {
        //         id: condition.value,
        //         text: condition.label,
        //         answers: condition.answers,
        //         right_answer_id: condition.answers.find((item) => item.is_right)
        //             .id,
        //     };
        // });
        // setRule(temp);
        let questions = conditions.map((condition) => {
            return {
                id: condition.value,
                text: condition.label,
                answers: condition.answers,
                right_answer_id: condition.answers.find((item) => item.is_right)
                    .id,
            };
        });
        setCriteriaList(
            criteriaList.map((cr) => {
                if (cr.id === selectedCriteriaEditindId) {
                    return { ...cr, questions: questions };
                } else return cr;
            })
        );
    };

    const handleSelect = (data) => {
        setSelectedTypeLocations(data);
    };

    const handleSelectCriteriaType = (data, id) => {
        console.log("data", data, id);
        setCriteriaList(
            criteriaList.map((item) => {
                if (item.id === id) {
                    return {
                        ...item,
                        selected_type_criteria: data,
                    };
                } else return item;
            })
        );
    };

    const handleDelete = (itemId) => {
        const result = window.confirm(
            "Вы уверены, что хотите удалить элемент?"
        );
        if (result) {
            setCriteriaList(criteriaList.filter((item) => item.id !== itemId));
        }
    };

    const handleEdit = (itemId) => {
        // Логика для редактирования элемента
        console.log(`Редактирование элемента с ID ${itemId}`);
    };

    const handleAddCriteria = () => {
        setCriteriaList([
            ...criteriaList,
            {
                id: Math.max(...criteriaList.map((item) => item.id), 0) + 1,
                value: "",
                label: "",
                selected_type_criteria: null,
                type_works: [],
                locations: [],
                type_locations: [],
                questions: [],
            },
        ]);
    };

    const handleAddRule = () => {
        let criteria = criteriaList.filter((criteria) => {
            if (criteria.selected_type_criteria) {
                return criteria;
            }
        });

        let type_locations = selectedTypeLocations.map((type) => ({
            id: type.value,
            text: type.label,
        }));

        let newRule = {
            compensatory_measures: rule.compensatory_measures,
            protections: rule.protections,
            criteria: criteria.map((criteria) => {
                if (criteria.selected_type_criteria.value === "type_location") {
                    return {
                        ...criteria,
                        type_locations: type_locations,
                    };
                } else return criteria;
            }),
        };
        console.log("newRule", newRule);
        apiInst
            .post("/rule/rule/", newRule)
            .then((resp) => {
                if (resp.data.result) {
                    navigate("/expert/rules/");
                    send_notify(resp.data.message, "success");
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const handleOpenModal = (criteria) => {
        setSelectedCriteriaEditindId(criteria.id);
        console.log("criteria", criteria);
        if (!criteria.selected_type_criteria) return;
        switch (criteria.selected_type_criteria.value) {
            case "type_work":
                console.log("type work exist");
                setModal(true);
                break;
            case "location":
                setModalLocation(true);
                break;
            case "type_location":
                break;
            case "question":
                setModalCondition(true);
                break;
            default:
                break;
        }
    };

    const listSelectedValue = (criteria) => {
        console.log("listSelectedValue", criteria);
        if (!criteria.selected_type_criteria) return;
        console.log("listSelectedValue", criteria);
        switch (criteria.selected_type_criteria.value) {
            case "type_work":
                return (
                    <div>
                        <p>Виды работ:</p>
                        <ul>
                            {criteria.type_works.map((work) => (
                                <p key={work.id}>{work.name}</p>
                            ))}
                        </ul>
                    </div>
                );
            case "location":
                return (
                    <div>
                        <p>Места проведения работ:</p>
                        <ul>
                            {criteria.locations.map((location) => (
                                <p key={location.id}>{location.name}</p>
                            ))}
                        </ul>
                    </div>
                );
            case "type_location":
                return (
                    <Select
                        options={typeOptionLocations}
                        placeholder="Выберите тип места проведения работ"
                        value={selectedTypeLocations}
                        onChange={handleSelect}
                        isMulti
                    ></Select>
                );
            case "question":
                console.log("que", criteria.questions);
                return (
                    <div>
                        <p>Условия:</p>
                        <ul>
                            {criteria.questions.map((condition) => (
                                <p key={condition.id}>
                                    {condition.text}{" "}
                                    {condition.answers.find(
                                        (answer) => answer.is_right === true
                                    )
                                        ? condition.answers.find(
                                              (answer) =>
                                                  answer.is_right === true
                                          ).text
                                        : ""}
                                </p>
                            ))}
                        </ul>
                    </div>
                );
            default:
                return <> </>;
        }
    };

    console.log("criteriaList", criteriaList);
    console.log("rule", rule);
    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <h2 className="text-center">Правило маскирования защит</h2>
                </div>
            </div>
            <div className="row">
                <div className="col-md-10 d-flex align-items-end">
                    <label className="form">Критерии: </label>
                </div>
                <div className="col-md-2">
                    <button
                        className="btn btn-primary"
                        onClick={handleAddCriteria}
                    >
                        Добавить критерий
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    {criteriaList.length > 0 ? (
                        <table>
                            <tr>
                                {/* <th>Тип критерия</th> */}
                                <th>Тип критерия</th>
                                <th>Выбранные значения</th>
                                <th>Действия</th>
                            </tr>
                            {criteriaList.map((criteria) => (
                                <tr key={criteria.id}>
                                    <td className="rule-td-name">
                                        <Select
                                            options={TYPES_CRITERIA_OPTIONS}
                                            placeholder="Выберите тип критерия"
                                            value={
                                                criteria.selected_type_criteria
                                            }
                                            onChange={(d) =>
                                                handleSelectCriteriaType(
                                                    d,
                                                    criteria.id
                                                )
                                            }
                                        ></Select>
                                    </td>
                                    <td>{listSelectedValue(criteria)}</td>
                                    <td className="td-action-rule">
                                        <button
                                            onClick={() =>
                                                handleOpenModal(criteria)
                                            }
                                            className="btn btn-primary btn-action-rule"
                                        >
                                            Изменить
                                        </button>
                                        <ModalChangeValue
                                            isModal={isModal}
                                            criteria={criteria}
                                            isModalLocation={isModalLocation}
                                            isModalCondition={isModalCondition}
                                            handleModalTypeWork={() =>
                                                setModal(false)
                                            }
                                            handleModalLocation={() =>
                                                setModalLocation(false)
                                            }
                                            handleModalQuestion={() =>
                                                setModalCondition(false)
                                            }
                                            handleLocations={handleLocations}
                                            handleTypeWorks={handleTypeWorks}
                                            handleConditions={handleConditions}
                                        ></ModalChangeValue>
                                        <button
                                            onClick={() =>
                                                handleDelete(criteria.id)
                                            }
                                            className="btn btn-danger btn-action-rule"
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </table>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
            {criteriaList.length > 0 ? (
                <div>
                    <div className="row">
                        <div className="col-md-10">
                            <h2 className="text-center">Защиты</h2>
                        </div>
                        <div className="col-md-2">
                            <button
                                className="btn btn-primary"
                                onClick={() => setModalProtection(true)}
                            >
                                Добавить/Изменить защиты
                            </button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md">
                            <ModalChoiceProtections
                                isModal={isModalProtection}
                                onClose={() => setModalProtection(false)}
                                handleClickAdd={handleProtections}
                                protections={protections}
                            ></ModalChoiceProtections>

                            {protections.length === 0 ? (
                                <div>
                                    {/* <h3 className="text-center">
                                        Выберите защиты
                                    </h3>
                                    <label className="text-center">
                                        Для выбора нажмите на кнопку изменить
                                    </label> */}
                                </div>
                            ) : (
                                <div className="list-conteiner">
                                    <table>
                                        <tr>
                                            <th>Название защиты</th>
                                            <th>Нужно ли маскирование</th>
                                            <th>Нужно ли демаскирование</th>
                                        </tr>
                                        {protections.map((protection) => (
                                            <CheckboxProtection
                                                id={protection.id}
                                                name={protection.name}
                                                isMasking={
                                                    protection.is_masking
                                                }
                                                isDemasking={
                                                    protection.is_demasking
                                                }
                                                onMaskingChange={(isChecked) =>
                                                    handleCheckboxChange(
                                                        protection.id,
                                                        "is_masking",
                                                        isChecked
                                                    )
                                                }
                                                onDemaskingChange={(
                                                    isChecked
                                                ) =>
                                                    handleCheckboxChange(
                                                        protection.id,
                                                        "is_demasking",
                                                        isChecked
                                                    )
                                                }
                                            >
                                                {protection.name}
                                            </CheckboxProtection>
                                        ))}
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )}
            <div className="row">
                <div className="col-md">
                    <label>Сопровождающие мероприятия: </label>
                    <textarea
                        name="compensatory_measures"
                        type="text"
                        disabled={false}
                        value={rule.compensatory_measures}
                        onChange={handleChange}
                        placeholder="Сопровождающие мероприятия"
                        title="Сопровождающие мероприятия"
                        id="description"
                        className="form-control"
                        data-toggle="tooltip"
                        data-placement="top"
                    ></textarea>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <button
                        className="btn btn-primary btn-save-rule"
                        onClick={handleAddRule}
                    >
                        Сохранить правило
                    </button>
                </div>
            </div>
        </div>
    );
}
