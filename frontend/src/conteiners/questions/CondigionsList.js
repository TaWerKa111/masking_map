import { apiInst } from "../../utils/axios";
import { useState, useEffect } from "react";
import AddElementButton from "../forms/AddElementForm";

export default function CondigionsList({ handleClickAdd, selectedConditions }) {
    const [conditions, setConditions] = useState(selectedConditions);

    useEffect(() => {}, []);

    const OnChangeName = (el) => {};

    const onAddClick = () => {
        let temp = Object.assign([], conditions);
        temp.push({
            id: conditions.length + 1,
            name: "",
            answers: [],
        });
        setConditions(temp);
    };

    const deleteClick = (event, key) => {
        let temp = conditions.filter((item) => item.id != key);
        setConditions(temp);
        console.log("delete el", key);
    };
    const editClick = (event, key) => {
        console.log("edit el", key);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <h2>Уточняющие вопросы</h2>
                    <button onClick={onAddClick}>Доавить вопрос</button>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    {conditions == null ? (
                        <p>
                            <h2>Нет правил!</h2>
                        </p>
                    ) : (
                        conditions.map((condition) => (
                            <div key={condition.id} className="itemOfQuestions">
                                <p>{condition.name}</p>
                                <AddElementButton
                                    is_edit={true}
                                    type_form="condition"
                                    className="btn"
                                    onSubmit={editClick}
                                    name={"Изменить"}
                                    value={condition}
                                ></AddElementButton>
                                <button
                                    className="btn"
                                    onClick={(el) =>
                                        deleteClick(el, condition.id)
                                    }
                                >
                                    Удалить
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
