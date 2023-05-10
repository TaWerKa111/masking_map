import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
// import Modal from "../modal/ModalTypeWork";
import ModalTypeWork from "../modal/ModalTypeWork";
import ModalChoiceProtections from "../modal/Protections";
import ModalLocation from "../modal/ModalLocation";
import CheckboxProtection from "../checkbox/CheckBoxProtection";
import ModalConditions from "../modal/ModalQuestions";

export default function RuleInfo(props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rule, setRule] = useState(props.rule);
    const [typeLocations, setTypeLocations] = useState([
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
        let params = {};
        // apiInst
        //     .get("/rules/", {params})
        //     .then((resp) => {
        //         setRules(resp.data);
        //     })
        //     .catch(e => console.log(e));
    }, []);

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

    const handleConditions = (conditions) => {};

    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <label>Название: </label>
                    <input
                        name="name_rule"
                        disabled={false}
                        value={rule.name}
                    ></input>
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
                    {/* <ul>
                            {
                                rule.type_locations.map(
                                    work => <p key={work.id}>{work.name}</p>
                                )
                            }
                        </ul> */}
                    <select
                        id="multi-select"
                        name="multi-select"
                        multiple
                        value={selectedTypeLocations}
                        onChange={handleOptionSelect}
                    >
                        {typeLocations.map((typeLocation) => (
                            <option
                                key={typeLocation.id}
                                value={typeLocation.id}
                            >
                                {typeLocation.name}
                            </option>
                        ))}
                    </select>
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
                            <p key={condition.id}>{condition.name}</p>
                        ))}
                    </ul>
                    <ModalConditions
                        isModal={isModalCondition}
                        onClose={() => setModalCondition(false)}
                        handleClickAdd={handleConditions}
                        conditions={rule.conditions}
                    ></ModalConditions>
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
                    <button>Сохранить правило</button>
                </div>
            </div>
        </div>
    );
}
