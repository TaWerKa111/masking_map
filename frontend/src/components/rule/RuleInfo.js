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
                    <label>Название: </label>
                    <input
                        name="name"
                        type="text"
                        disabled={false}
                        value={rule.name}
                        onChange={handleChange}
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
                    <label>Виды работ:</label>
                </div>
                <div className="col-md">
                    <p>Виды работ:</p>
                    <ul>
                        {rule.works.map((work) => (
                            <p key={work.id}>{work.name}</p>
                        ))}
                    </ul>
                    <button onClick={() => setModal(true)}>Изменить</button>
                    <ModalTypeWork
                        isModal={isModal}
                        onClose={() => setModal(false)}
                        handleClickAdd={handleTypeWorks}
                        works={rule.works}
                    ></ModalTypeWork>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <label>Локации:</label>
                </div>
                <div className="col-md">
                    <p>Локации:</p>
                    <ul>
                        {rule.locations.map((location) => (
                            <p key={location.id}>{location.name}</p>
                        ))}
                    </ul>
                    <button onClick={() => setModalLocation(true)}>
                        Изменить
                    </button>
                    <ModalLocation
                        isModal={isModalLocation}
                        onClose={() => setModalLocation(false)}
                        handleClickAdd={handleLocations}
                        locations={rule.locations}
                    ></ModalLocation>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <label>Тип Локаций:</label>
                </div>
                <div className="col-md">
                    <p>Тип Локаций:</p>
                    <Select
                        options={typeOptionLocations}
                        placeholder="Select color"
                        value={selectedTypeLocations}
                        onChange={handleSelect}
                        isMulti
                    ></Select>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <label>Условия:</label>
                </div>
                <div className="col-md">
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
                    <ModalQuestions
                        isModal={isModalCondition}
                        onClose={() => setModalCondition(false)}
                        handleClickAdd={handleConditions}
                        conditions={rule.conditions}
                    ></ModalQuestions>
                    <button onClick={() => setModalCondition(true)}>
                        Изменить
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <h2 className="text-center">Защиты</h2>
                    <button onClick={() => setModalProtection(true)}>
                        Изменить
                    </button>
                    <ModalChoiceProtections
                        isModal={isModalProtection}
                        onClose={() => setModalProtection(false)}
                        handleClickAdd={handleProtections}
                        protections={protections}
                    ></ModalChoiceProtections>

                    <div className="list-conteiner">
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
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <button onClick={handleAddRule}>Сохранить правило</button>
                </div>
            </div>
        </div>
    );
}
