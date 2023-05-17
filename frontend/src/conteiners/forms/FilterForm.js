import { useState } from "react";
import Select from "react-select";

function FilterElementForm(props) {
    const [searchName, setSearchName] = useState(null);
    const [optionList, setOptionList] = useState([]);
    const [optionTypeLocations, setOptionTypeLocations] = useState(
        props.optionTypeLocations
    );
    const [selectedTypeLocation, setSelectedTypeLocation] = useState([]);

    const handleSubmit = (event) => {
        event.preventDefault();
        let params = {
            name: searchName,
            type_location: selectedTypeLocation,
        };
        props.onClickFiltered(params);
    };

    const handleChange = (event) => {
        setSearchName(event.target.value);
    };

    const handleSelect = (data) => {
        setSelectedTypeLocation(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div class="col-md-4">
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
                    <label>Типы локаций</label>
                    <Select
                        options={optionTypeLocations}
                        placeholder="Выберите типы локаций"
                        value={selectedTypeLocation}
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
    const [optionList, setOptionList] = useState([]);
    const [optionDepartaments, setOptionDepartaments] = useState(
        props.departaments.map((item) => ({ value: item.id, label: item.name }))
    );
    const [selectedDepataments, setSelectedDepartaments] = useState([]);

    const handleSubmit = (event) => {
        event.preventDefault();
        let params = {
            name: searchName,
            departaments: selectedDepataments,
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
                <div class="col-md-4">
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
            typeProtections: selectedTypeProtections,
        };
        props.onClickFiltered(params);
    };

    const handleChange = (event) => {
        setSearchName(event.target.value);
    };

    const handleSelect = (data) => {
        setOptionTypeProtections(data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div class="col-md-4">
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

function FilterButton(props) {
    const [showForm, setShowForm] = useState(false);
    let name = "Фильтры";

    const handleClick = () => {
        setShowForm(!showForm);
    };
    let filterForm = <div></div>;

    if (props.name === "locations") {
        filterForm = (
            <FilterElementForm
                optionTypeLocations={props.optionTypeLocations}
                onClickFiltered={props.onClickFiltered}
            ></FilterElementForm>
        );
    } else if (props.name === "works") {
        filterForm = (
            <FilterTypeWork
                optionTypeLocations={props.optionTypeLocations}
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
    } else {
        filterForm = (
            <FilterElementForm
                optionTypeLocations={props.optionTypeLocations}
                onClickFiltered={props.onClickFiltered}
            ></FilterElementForm>
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
