import { useSearchParams } from "react-router-dom";
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
    const [isModal, setModal] = useState(false);
    const [isModalLocation, setModalLocation] = useState(false);
    const [isModalProtection, setModalProtection] = useState(false);
    const [isModalCondition, setModalCondition] = useState(false);
    const [protections, setProtections] = useState(rule.protections);

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

    const handleOptionSelect = (event) => {
        const optionValue = event.target.value;
        const optionIndex = selectedTypeLocations.indexOf(optionValue);
        if (optionIndex > -1) {
            // Remove the option from the selected options
            setSelectedTypeLocations([
                ...selectedTypeLocations.slice(0, optionIndex),
                ...selectedTypeLocations.slice(optionIndex + 1),
            ]);
        } else {
            // Add the option to the selected options
            setSelectedTypeLocations([...selectedTypeLocations, optionValue]);
        }
        let temp_rule = Object.assign({}, rule);
        temp_rule.type_locations = selectedTypeLocations;
        setRule(temp_rule);
        console.log("rule", rule.type_locations);
    };

    const handleTypeWorks = (typeWorks) => {
        console.log("type_works", typeWorks);
        setModal(false);
        let temp = Object.assign({}, rule);
        temp["works"] = typeWorks;
        setRule(temp);
    };

    const handleLocations = (locations) => {
        console.log("locations", locations);
        setModalLocation(false);
        let temp = Object.assign({}, rule);
        temp["locations"] = locations;
        setRule(temp);
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
        setProtections((prevTypes) =>
            prevTypes.map((type) => {
                if (type.id === id) {
                    return {
                        ...type,
                        [field]: isChecked,
                    };
                } else {
                    return type;
                }
            })
        );
    };

    const handleConditions = (conditions) => {
        console.log("conditions", conditions);
        setModalCondition(false);
        let temp = Object.assign({}, rule);
        temp["conditions"] = conditions.map((condition) => {
            return {
                id: condition.value,
                text: condition.label,
                answers: condition.answers,
            };
        });
        setRule(temp);
    };

    const handleSelect = (data) => {
        setSelectedTypeLocations(data);
    };

    const handleAddRule = () => {
        let newRule = {
            name: rule.name,
            compensatory_measures: rule.compensatory_measures,
            type_locations: selectedTypeLocations.map((type) => ({
                id: type.value,
                text: type.label,
            })),
            protections: rule.protections,
            works: rule.works,
            locations: rule.locations,
            questions: rule.conditions,
        };
        console.log("newRule", newRule);
        // apiInst
        //     .post("/rule/rule/", newRule)
        //     .then((resp) => {
        //         if (resp.data.result) {
        //             send_notify(resp.data.message, "success");
        //         } else send_notify(resp.data.message, "error");
        //     })
        //     .catch((e) => {
        //         send_notify(e.response.data.message, "error");
        //         console.log(e.response.data.message);
        //     });
    };

    console.log("rule", rule);
    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <h2 className="text-center">Правило</h2>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <label className="form">Название: </label>
                    <input
                        name="name"
                        type="text"
                        disabled={false}
                        value={rule.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Введите название правила"
                    ></input>
                </div>
            </div>
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
                    <table>
                        <tr>
                            <th>Условие</th>
                            <th>Выбранные значения</th>
                            <th>Действия</th>
                        </tr>
                        <tr>
                            <td className="rule-td-name"><label>Виды работ:</label></td>
                            <td>
                                <p>Виды работ:</p>
                                <ul>
                                    {rule.works.map((work) => (
                                        <p key={work.id}>{work.name}</p>
                                    ))}
                                </ul>
                            </td>
                            <td className="td-btn">
                                <button className="btn btn-primary" onClick={() => setModal(true)}>Изменить</button>
                                <ModalTypeWork
                                    isModal={isModal}
                                    onClose={() => setModal(false)}
                                    handleClickAdd={handleTypeWorks}
                                    works={rule.works}
                                ></ModalTypeWork>
                            </td>
                        </tr>
                        <tr>
                            <td className="rule-td-name"><label>Локации:</label></td>
                            <td>
                                <p>Локации:</p>
                                <ul>
                                    {rule.locations.map((location) => (
                                        <p key={location.id}>{location.name}</p>
                                    ))}
                                </ul>
                            </td>
                            <td className="td-btn">
                                <button className="btn btn-primary" onClick={() => setModalLocation(true)}>
                                    Изменить
                                </button>
                                <ModalLocation
                                    isModal={isModalLocation}
                                    onClose={() => setModalLocation(false)}
                                    handleClickAdd={handleLocations}
                                    locations={rule.locations}
                                ></ModalLocation>
                            </td>
                        </tr>
                        <tr>
                            <td className="rule-td-name"><p>Тип Локаций:</p></td>
                            <td colspan="2">
                                <Select
                                    options={typeOptionLocations}
                                    placeholder="Select color"
                                    value={selectedTypeLocations}
                                    onChange={handleSelect}
                                    isMulti
                                ></Select>
                            </td>
                        </tr>
                        <tr>
                            <td className="rule-td-name"><label>Условия:</label></td>
                            <td>
                                <p>Условия:</p>
                                <ul>
                                    {rule.conditions.map((condition) => (
                                        <p key={condition.id}>
                                            {condition.text}{" "}
                                            {
                                                condition.answers.find(
                                                    (answer) => answer.is_right === true
                                                ).text
                                            }
                                        </p>
                                    ))}
                                </ul>
                            </td>
                            <td className="td-btn">
                                <ModalQuestions
                                    isModal={isModalCondition}
                                    onClose={() => setModalCondition(false)}
                                    handleClickAdd={handleConditions}
                                    conditions={rule.conditions}
                                ></ModalQuestions>
                                <button className="btn btn-primary" onClick={() => setModalCondition(true)}>
                                    Изменить
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <div className="row">
                <div className="col-md-11">
                    <h2 className="text-center">Защиты</h2>
                </div>
                <div className="col-md-1">
                    <button className="btn btn-primary" onClick={() => setModalProtection(true)}>
                        Изменить
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
                    {
                        protections.length === 0 ? (
                            <div>
                                <h3 className="text-center">Выберите защиты</h3>
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
                                            isMasking={protection.is_masking}
                                            isDemasking={protection.is_demasking}
                                            onMaskingChange={(isChecked) =>
                                                handleCheckboxChange(
                                                    protection.id,
                                                    "is_masking",
                                                    isChecked
                                                )
                                            }
                                            onDemaskingChange={(isChecked) =>
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
                        )
                    }
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <button className="btn btn-primary btn-save-rule" onClick={handleAddRule}>Сохранить правило</button>
                </div>
            </div>
        </div>
    );
}
