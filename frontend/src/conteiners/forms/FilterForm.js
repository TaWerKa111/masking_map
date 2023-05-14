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
            <div class="col-md-4">
                <label className="">Название:</label>
                <input
                    type="text"
                    name="name"
                    value={searchName}
                    onChange={(e) => handleChange(e)}
                    className=""
                />
            </div>
            <div className="col-md-4 d-flex">
                <label>Отдел</label>
                <Select
                    options={optionTypeLocations}
                    placeholder="Select color"
                    value={selectedTypeLocation}
                    onChange={handleSelect}
                    isMulti
                ></Select>
            </div>
            <button type="submit" className="btn btn-primary">
                Применить фильтр
            </button>
        </form>
    );
}

function FilterButton(props) {
    const [showForm, setShowForm] = useState(false);
    let name = "Фильтры";

    const handleClick = () => {
        setShowForm(!showForm);
    };

    return (
        <div>
            <button onClick={handleClick} className="btn btn-primary">
                {name}
            </button>
            {showForm && (
                <div>
                    <FilterElementForm
                        optionTypeLocations={props.optionTypeLocations}
                        onClickFiltered={props.onClickFiltered}
                    ></FilterElementForm>
                </div>
            )}
        </div>
    );
}

export default FilterButton;
