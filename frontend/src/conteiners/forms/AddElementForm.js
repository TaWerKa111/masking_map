import React, { useState } from 'react';

function ElementForm(props) {
  const [value, setValue] = useState(props.value);
  const [types, setTypes] = useState(props.types);

  const handleSubmit = (event) => {
    event.preventDefault();
    props.onSubmit(value);
    // setValue({});
  };

  const handleChange = (event) => {
    let temp_value = Object.assign({}, value);;
    temp_value[event.target.name] = event.target.value;
    setValue(temp_value);
    console.log("temp", temp_value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Название:
        <input type="text" value={value.name} onChange={e => handleChange(e)} />
      </label>
      <label>
        Тип:
        <select name="type" value={value.type} onChange={handleChange}>
            <option value="">Выберите тип</option>
            {types.map(tepeEl => (
              <option key={tepeEl.id} value={tepeEl.name}>{tepeEl.name}</option>
            ))}
        </select>
      </label>
      <button type="submit">Добавить</button>
    </form>
  );
}

function AddElementButton(props) {
    const [showForm, setShowForm] = useState(false);
    let name = !props.name ? "Добавить" : props.name;
    const handleClick = () => {
      setShowForm(!showForm);
    };

    return (
      <div>
        <button onClick={handleClick}>{name}</button>
        {showForm && <ElementForm onSubmit={props.onSubmit} value={props.value} types={props.types}/>}
      </div>
    );
  }
  
  export default AddElementButton;
