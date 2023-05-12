import { useState } from "react";

function FilterElementForm(props) {
    const [value, setValue] = useState(!props.value ? { name: "" } : props.value);

    const handleSubmit = (event) => {
        event.preventDefault();
        props.onSubmit(value);
    };

    const handleChange = (event) => {
        let temp_value = Object.assign({}, value);
        temp_value[event.target.name] = event.target.value;
        setValue(temp_value);
        console.log("temp", event.target.value);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div class="form-group form-add-el">
                <label className="">Название:</label>
                <input
                    type="text"
                    name="name"
                    value={value.name}
                    onChange={(e) => handleChange(e)}
                    className=""
                />
            </div>
            <button type="submit" className="btn btn-primary">
                {props.btnName}
            </button>
        </form>
    );
}

function FilterButton(props) {
    const [showForm, setShowForm] = useState(false);
    let name = !props.name ? "Фильтры" : props.name;

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
                    <FilterElementForm></FilterElementForm>
                    <h1>Фильтры</h1>
                </div>
            )}
        </div>
    );
}

export default FilterButton;