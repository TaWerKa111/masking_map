import { useState } from "react";
import Select from "react-select";

function FilterLocations(props) {
    const [searchName, setSearchName] = useState(null);
    const [optionTypeLocations, setTypeLocations] = useState(
        props.typeLocations.map((typeLocation) => ({
            value: typeLocation.id,
            label: typeLocation.name,
        }))
    );
    const [selectedTypeLocations, setSelectedTypeLocations] = useState([]);

    const handleSubmit = (event) => {
        event.preventDefault();
        let params = {
            name: searchName,
            "type_location_ids[]": selectedTypeLocations.map(
                (typeLocation) => typeLocation.value
            ),
        };
        props.onClickFiltered(params);
    };

    const handleChange = (event) => {
        setSearchName(event.target.value);
    };

    const handleSelect = (data) => {
        setSelectedTypeLocations(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-4">
                    <label className="">Название:</label>
                    <input
                        type="text"
                        name="name"
                        value={searchName}
                        onChange={(e) => handleChange(e)}
                        className="form-control"
                    />
                </div>
                <div className="col-md-4">
                    <label>Типы мест проведения работ</label>
                    <Select
                        options={optionTypeLocations}
                        placeholder="Выберите типы мест проведения работ"
                        value={selectedTypeLocations}
                        onChange={handleSelect}
                        isMulti
                        className=""
                    ></Select>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <button type="submit" className="btn btn-primary btn-full">
                        Применить фильтр
                    </button>
                </div>
            </div>
        </form>
    );
}

function FilterTypeWork(props) {
    const [searchName, setSearchName] = useState(null);
    const [optionDepartaments, setOptionDepartaments] = useState(
        props.departaments.map((item) => ({ value: item.id, label: item.name }))
    );
    const [selectedDepataments, setSelectedDepartaments] = useState([]);
    console.log("departaments", optionDepartaments);
    const handleSubmit = (event) => {
        event.preventDefault();
        let params = {
            name: searchName,
            "departament_ids[]": selectedDepataments.map((item) => item.value),
        };
        props.onClickFiltered(params);
    };

    const handleChange = (event) => {
        setSearchName(event.target.value);
    };

    const handleSelect = (data) => {
        setSelectedDepartaments(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-4">
                    <label className="">Название:</label>
                    <input
                        type="text"
                        name="name"
                        value={searchName}
                        onChange={(e) => handleChange(e)}
                        className="form-control"
                    />
                </div>
                <div className="col-md-4">
                    <label>Отдел</label>
                    <Select
                        options={optionDepartaments}
                        placeholder="Выберите отдел"
                        value={selectedDepataments}
                        onChange={handleSelect}
                        isMulti
                    ></Select>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <button type="submit" className="btn btn-primary btn-full">
                        Применить фильтр
                    </button>
                </div>
            </div>
        </form>
    );
}

function FilterProtection(props) {
    const [searchName, setSearchName] = useState(null);
    const [optionList, setOptionList] = useState([]);
    const [optionTypeProtections, setOptionTypeProtections] = useState(
        props.typeProtections.map((item) => ({
            value: item.id,
            label: item.name,
        }))
    );
    const [selectedTypeProtections, setSelectedTypeProtections] = useState([]);

    const handleSubmit = (event) => {
        event.preventDefault();
        let params = {
            name: searchName,
            "type_protections_ids[]": selectedTypeProtections.map(
                (item) => item.value
            ),
        };
        props.onClickFiltered(params);
    };

    const handleChange = (event) => {
        setSearchName(event.target.value);
    };

    const handleSelect = (data) => {
        setSelectedTypeProtections(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-4">
                    <label className="">Название:</label>
                    <input
                        type="text"
                        name="name"
                        value={searchName}
                        onChange={(e) => handleChange(e)}
                        className="form-control"
                    />
                </div>
                <div className="col-md-4">
                    <label>Система АСУТП</label>
                    <Select
                        options={optionTypeProtections}
                        placeholder="Выберите систему АСУТП"
                        value={selectedTypeProtections}
                        onChange={handleSelect}
                        isMulti
                        className=""
                    ></Select>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <button type="submit" className="btn btn-primary btn-full">
                        Применить фильтр
                    </button>
                </div>
            </div>
        </form>
    );
}

function FilterRules(props) {
    const [searchName, setSearchName] = useState(null);
    const [optionList, setOptionList] = useState([]);
    const [optionTypeProtections, setOptionTypeProtections] = useState([]);
    const [selectedTypeProtections, setSelectedTypeProtections] = useState([]);

    const handleSubmit = (event) => {
        event.preventDefault();
        let params = {
            name: searchName,
            "type_protections_ids[]": selectedTypeProtections.map(
                (item) => item.value
            ),
        };
        props.onClickFiltered(params);
    };

    const handleSelect = (data) => {
        setSelectedTypeProtections(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-4">
                    <label>Система АСУТП</label>
                    <Select
                        options={[]}
                        placeholder="Выберите систему АСУТП"
                        value={[]}
                        onChange={handleSelect}
                        isMulti
                        className=""
                    ></Select>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <button type="submit" className="btn btn-primary btn-full">
                        Применить фильтр
                    </button>
                </div>
            </div>
        </form>
    );
}

function FilterButton(props) {
    const [showForm, setShowForm] = useState(false);
    let name = "Фильтры";

    const handleClick = () => {
        setShowForm(!showForm);
    };
    let filterForm = <div></div>;

    if (props.name === "locations") {
        filterForm = (
            <FilterLocations
                typeLocations={props.typeLocations}
                onClickFiltered={props.onClickFiltered}
            ></FilterLocations>
        );
    } else if (props.name === "works") {
        filterForm = (
            <FilterTypeWork
                departaments={props.departaments}
                onClickFiltered={props.onClickFiltered}
            ></FilterTypeWork>
        );
    } else if (props.name === "protections") {
        filterForm = (
            <FilterProtection
                typeProtections={props.typeProtections}
                onClickFiltered={props.onClickFiltered}
            ></FilterProtection>
        );
    } else if (props.name === "rules") {
        filterForm = (
            <FilterRules
                typeProtections={props.typeProtections}
                onClickFiltered={props.onClickFiltered}
            ></FilterRules>
        );
    } else {
        filterForm = (
            <FilterLocations
                optionTypeLocations={props.optionTypeLocations}
                onClickFiltered={props.onClickFiltered}
            ></FilterLocations>
        );
    }

    return (
        <div>
            <button onClick={handleClick} className="btn btn-primary">
                {name}
            </button>
            {showForm && <div>{filterForm}</div>}
        </div>
    );
}

export default FilterButton;
