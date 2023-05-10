import React, { useState } from "react";

function AddSimpleElementForm(props) {
    const [name, setName] = useState(props.value);

    const handleSubmit = (event) => {
        event.preventDefault();
        props.onSubmit(name);
    };

    const handleChange = (event) => {
        setName(event.target.value);
        console.log("name", event.target.value);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Название:
                <input
                    type="text"
                    value={name}
                    onChange={(e) => handleChange(e)}
                />
            </label>
            <button type="submit">{props.btnName}</button>
        </form>
    );
}

function AddLocAndWorkElementForm(props) {
    const [value, setValue] = useState(
        !props.value ? { name: "", type: null } : props.value
    );
    const [types, setTypes] = useState(props.types);

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
            <label>
                Название:
                <input
                    type="text"
                    name="name"
                    value={value.name}
                    onChange={(e) => handleChange(e)}
                />
            </label>
            <label>
                Тип:
                <select name="type" value={value.type} onChange={handleChange}>
                    <option value="">Выберите тип</option>
                    {types.map((typeEl) => (
                        <option key={typeEl.id} value={typeEl.id}>
                            {typeEl.name}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">{props.btnName}</button>
        </form>
    );
}

function AddProtectionElementForm(props) {
    const [value, setValue] = useState(
        !props.value ? { name: "", type: null, is_end: false } : props.value
    );
    const [types, setTypes] = useState(props.types);

    const handleSubmit = (event) => {
        event.preventDefault();
        props.onSubmit(value);
    };

    const handleChange = (event) => {
        let temp_value = Object.assign({}, value);
        temp_value[event.target.name] =
            event.target.name == "is_end"
                ? !temp_value.is_end
                : event.target.value;
        setValue(temp_value);
        console.log("temp", temp_value);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Название:
                <input
                    type="text"
                    name="name"
                    value={value.name}
                    onChange={(e) => handleChange(e)}
                />
            </label>
            <label>
                Тип:
                <select name="type" value={value.type} onChange={handleChange}>
                    <option value="">Выберите тип</option>
                    {types.map((typeEl) => (
                        <option key={typeEl.id} value={typeEl.id}>
                            {typeEl.name}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                Является ли защита выходом:
                <input
                    name="is_end"
                    type="checkbox"
                    value={value.id_end}
                    checked={value.is_end}
                    onChange={handleChange}
                />
            </label>
            <button type="submit">{props.btnName}</button>
        </form>
    );
}

function AddConditionElementForm(props) {
    const [value, setValue] = useState(
        !props.value ? { name: "", answers: [] } : props.value
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        props.onSubmit(value);
    };

    const handleChange = (event) => {
        let temp_value = Object.assign({}, value);
        temp_value[event.target.name] = event.target.value;
        setValue(temp_value);
        console.log("temp", temp_value);
    };

    const handleChangeAnswer = (event, id) => {
        let temp_value = Object.assign({}, value);
        let answers = temp_value.answers.map((ans) =>
            ans.id === id
                ? { ...ans, [event.target.name]: event.target.value }
                : ans
        );
        temp_value.answers = answers;
        setValue(temp_value);
        console.log("temp", temp_value, id);
    };

    const handleChangeChekedAnswer = (event, id) => {
        let temp_value = Object.assign({}, value);

        let answers = temp_value.answers
            .map((ans) =>
                ans.id === id
                    ? { ...ans, [event.target.name]: event.target.checked }
                    : ans
            )
            .map((ans) =>
                ans.id !== id && ans.is_right == true
                    ? { ...ans, [event.target.name]: false }
                    : ans
            );

        temp_value.answers = answers;
        setValue(temp_value);
        console.log("temp", temp_value, id);
    };

    const deleteClick = (event, id) => {
        event.preventDefault();
        let temp = Object.assign({}, value);
        let temp_answers = temp.answers.filter((item) => item.id != id);
        temp.answers = temp_answers;
        setValue(temp);
    };

    const onAddClick = () => {
        let temp = Object.assign({}, value);
        temp.answers.push({
            id: temp.answers.length + 1,
            name: "",
            is_right: false,
        });
        setValue(temp);
    };

    console.log("conditions", value);
    return (
        <form onSubmit={handleSubmit}>
            <div>
                Название:
                <input
                    type="text"
                    name="name"
                    value={value.name}
                    onChange={(e) => handleChange(e)}
                />
            </div>
            <div>
                <button onClick={onAddClick}>Добавить ответ</button>
            </div>
            <div>
                Ответы
                {!value.answers ? (
                    <p>
                        <h2>Нет ответов!</h2>
                    </p>
                ) : (
                    value.answers.map((answer) => (
                        <div key={answer.id}>
                            <input
                                type="text"
                                name="name"
                                value={answer.name}
                                onChange={(e) =>
                                    handleChangeAnswer(e, answer.id)
                                }
                            />
                            <input
                                type="checkbox"
                                name="is_right"
                                checked={answer.is_right}
                                onChange={(e) =>
                                    handleChangeChekedAnswer(e, answer.id)
                                }
                            />
                            <button
                                className="btn"
                                onClick={(el) => deleteClick(el, answer.id)}
                            >
                                Удалить
                            </button>
                        </div>
                    ))
                )}
            </div>
            <button type="submit">{props.btnName}</button>
        </form>
    );
}

function AddElementButton(props) {
    const [showForm, setShowForm] = useState(false);
    let name = !props.name ? "Добавить" : props.name;
    const handleClick = () => {
        setShowForm(!showForm);
    };

    if (props.type_form == "simple") {
        return (
            <div>
                <button onClick={handleClick}>{name}</button>
                {showForm && (
                    <AddSimpleElementForm
                        btnName={name}
                        onSubmit={props.onSubmit}
                        value={props.value}
                    />
                )}
            </div>
        );
    } else if (["work", "loc"].includes(props.type_form)) {
        return (
            <div>
                <button onClick={handleClick}>{name}</button>
                {showForm && (
                    <AddLocAndWorkElementForm
                        btnName={name}
                        onSubmit={props.onSubmit}
                        value={props.value}
                        types={props.types}
                    />
                )}
            </div>
        );
    } else if (props.type_form == "protection") {
        return (
            <div>
                <button onClick={handleClick}>{name}</button>
                {showForm && (
                    <AddProtectionElementForm
                        btnName={name}
                        onSubmit={props.onSubmit}
                        value={props.value}
                        types={props.types}
                    />
                )}
            </div>
        );
    } else if (props.type_form == "condition") {
        return (
            <div>
                <button onClick={handleClick}>{name}</button>
                {showForm && (
                    <AddConditionElementForm
                        btnName={name}
                        onSubmit={props.onSubmit}
                        value={props.value}
                    />
                )}
            </div>
        );
    }

    return (
        <div>
            <button onClick={handleClick}>{name}</button>
            {showForm && (
                <AddSimpleElementForm
                    btnName={name}
                    onSubmit={props.onSubmit}
                    value={props.value}
                    types={props.types}
                />
            )}
        </div>
    );
}

export default AddElementButton;