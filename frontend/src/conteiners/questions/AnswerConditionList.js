import { apiInst } from "../../utils/axios";
import { useState, useEffect } from "react";

export default function AnswerConditionList({
    handleClickAdd,
    selectedConditions,
}) {
    const [conditions, setConditions] = useState(selectedConditions);

    useEffect(() => {}, []);

    const handleChangeChekedAnswer = (event, id) => {
        let temp = Object.assign({}, conditions);
        temp.answer_id = id;
        setConditions(temp);
        console.log("temp", temp, id);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <h2>Уточняющие вопросы</h2>
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
                            <div key={condition.id} className="itemOfQuestions">
                                <p>{condition.name}</p>
                                {condition.answers.map((answer) => (
                                    <div key={answer.id}>
                                        <label>{answer.name}</label>
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
                                                    answer.id
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
