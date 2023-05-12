import MnObjectList from "../../components/masking/MnObjectList";
import { apiInst } from "../../utils/axios";
import { useState, useEffect } from "react";

export default function QuestionInfo({
    handleClickAdd,
    question_id,
    question_info,
}) {
    const [question, setQuestion] = useState(question_info ? question_info :{
        "name": "",
        "answers":[],
    });

    useEffect(() => {
        if (question_id) {
            setQuestion(question_id);
        }
        else {
            if (!question) {
                setQuestion({
                    "name": "",
                    "answers":[],
                });
            }
        }
    }, [question_id]);

    const handleSubmit = (event) => {
        event.preventDefault();
        handleClickAdd(question);
    };

    const OnAddAnswer = (el) => {
        const newAnswers = [...question.answers];
        newAnswers.push({
            "name": "",
            "id": newAnswers.length + 1,
        });
        setQuestion({
          ...question,
            "answers": newAnswers,
        });
    };

    const OnChangeName = (el) => {
        setQuestion({
          ...question,
                "name": el.target.value,
        });
    };

    const OnChangeNameAnswer = (event, el) => {
        let temp_value = Object.assign({}, question);
        let answers = temp_value.answers.map((ans) =>
            ans.id === el.id
                ? { ...ans, ["name"]: event.target.value }
                : ans
        );
        temp_value.answers = answers;
        setQuestion(temp_value);
    };

    const OnDeleteAnswer = (el) => {
        const newAnswers = [...question.answers];
        setQuestion({
          ...question,
            "answers": newAnswers.filter((answer) => answer.id !== el.id),
        });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <form onSubmit={handleSubmit}>
                        <button type="submit" className="btn btn-primary">Добавить</button>
                        <div className="form-group">
                            <label htmlFor="name">Название</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="name"
                                value={question.name}
                                onChange={OnChangeName}
                            />
                            <small id="nameHelp" className="form-text text-muted">
                                Введите название
                            </small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="answers">Ответы</label>
                            <button type="button" className="btn btn-primary" onClick={OnAddAnswer}>Добавить ответ</button>
                            {
                                question.answers.map((answer, index) => {
                                    return (
                                        <div key={index} className="form-group">
                                            <label htmlFor="answers">Текст ответа</label>
                                            <div className="d-flex">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="answers"
                                                    value={answer.name}
                                                    onChange={(e) => OnChangeNameAnswer(e, answer)}
                                                ></input>
                                                <button className="btn btn-danger" onClick={() => OnDeleteAnswer(answer)}>Удалить</button>
                                            </div>
                                            <small id="nameHelp" className="form-text text-muted">
                                                Введите текст
                                            </small>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
