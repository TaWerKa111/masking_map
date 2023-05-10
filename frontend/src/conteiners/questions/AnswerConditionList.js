import { apiInst } from "../../utils/axios";
import { useState, useEffect } from "react";

export default function AnswerConditionList({
    handleClickAdd,
    selectedConditions,
}) {
    const [conditions, setConditions] = useState(selectedConditions);

    useEffect(() => {}, []);

    const handleChangeChekedAnswer = (event, answer_id, condition_id) => {
        let temp = Object.assign([], conditions);
        setConditions(temp.map(
            item => {
                if (item.id === condition_id && item.answer_id !== answer_id){
                    return {
                        ...item,
                        answer_id: answer_id
                    }
                }
                return {
                    ...item,
                    answer_id: null 
                }
            }
        ));
        console.log("temp", temp, answer_id);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        handleClickAdd(conditions);
    };

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md">
                        <button type="submit" className="btn btn-primary">Принять ответы</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md">
                        {conditions == null ? (
                            <p>
                                <h2>Нет вопросов!</h2>
                            </p>
                        ) : (
                            conditions.map((condition) => (
                                <div key={condition.id} className="form-check question">
                                    <p className="h4">{condition.name}?</p>
                                    {condition.answers.map((answer) => (
                                        <div key={answer.id} className="answer">
                                            <label className="form-check-label">{answer.name}</label>
                                            <input
                                                type="checkbox"
                                                name="is_right"
                                                checked={
                                                    answer.id ===
                                                    condition.answer_id
                                                }
                                                onChange={(e) =>
                                                    handleChangeChekedAnswer(
                                                        e,
                                                        answer.id,
                                                        condition.id
                                                    )
                                                }
                                                className="form-check-input"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
