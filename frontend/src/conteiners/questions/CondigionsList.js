import { apiInst } from "../../utils/axios";
import { useState, useEffect } from "react";
import AddElementButton from "../forms/AddElementForm";
import Select from "react-select";

export default function CondigionsList({ handleClickAdd, selectedConditions }) {
    const [selectedQuestion, setSelectedQuestions] = useState(
        selectedConditions
            ? selectedConditions.map((condition) => ({
                  value: condition.id,
                  label: condition.text,
                  answers: condition.answers,
              }))
            : []
    );
    const [questions, setQuestions] = useState([]);
    const [value, setValue] = useState({ name: "", answers: [] });

    useEffect(() => {
        apiInst
            .get("/rule/questions/", { params: { limit: 100 } })
            .then((resp) => {
                setQuestions(
                    resp.data.questions.map((question) => {
                        return {
                            value: question.id,
                            label: question.text,
                            answers: question.answers,
                        };
                    })
                );
            })
            .catch((err) => {
                console.log(err);
                setQuestions([]);
            });
    }, []);

    const handleSelect = (data) => {
        setSelectedQuestions(data);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        handleClickAdd(selectedQuestion);
    };

    const handleChangeChekedAnswer = (event, que_id, id) => {
        setSelectedQuestions(
            selectedQuestion.map((question) => {
                if (question.id === que_id) {
                    console.log(question);
                    question.answers = question.answers
                        .map((ans) =>
                            ans.id === id
                                ? {
                                      ...ans,
                                      [event.target.name]: event.target.checked,
                                  }
                                : ans
                        )
                        .map((ans) =>
                            ans.id !== id && ans.is_right == true
                                ? { ...ans, [event.target.name]: false }
                                : ans
                        );
                    return question;
                } else {
                    return question;
                }
            })
        );
    };

    console.log(questions);
    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <form onSubmit={handleSubmit}>
                        {questions == null ? (
                            <p>
                                <h2>Нет правил!</h2>
                            </p>
                        ) : (
                            <div>
                                <Select
                                    options={questions}
                                    placeholder="Выберите вопрос"
                                    value={selectedQuestion}
                                    onChange={handleSelect}
                                    isMulti
                                ></Select>
                                {selectedQuestion.map((question) => (
                                    <div>
                                        <div>
                                            <h3>{question.label}</h3>
                                        </div>
                                        <div>
                                            Ответы
                                            {!question.answers ? (
                                                <p>
                                                    <h2>Нет ответов!</h2>
                                                </p>
                                            ) : (
                                                question.answers.map(
                                                    (answer) => (
                                                        <div key={answer.id}>
                                                            <label>
                                                                {answer.text}
                                                            </label>
                                                            <input
                                                                type="checkbox"
                                                                name="is_right"
                                                                checked={
                                                                    answer.is_right
                                                                }
                                                                onChange={(e) =>
                                                                    handleChangeChekedAnswer(
                                                                        e,
                                                                        question.id,
                                                                        answer.id
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    )
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                        >
                            Применить
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
