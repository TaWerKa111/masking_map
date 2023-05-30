import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import ModalQuestion from "../../components/modal/ModalQuestion";
import send_notify from "../../utils/toast";

export default function BankQuestions() {
    const [bankQuestions, setBankQuestions] = useState([]);
    const [isModalQuestion, setModalQuestion] = useState(false);
    const [isAddModalQuestion, setAddModalQuestion] = useState(false);

    const fetchQuestions = () => {
        let params = {
            limit: 100,
        };
        apiInst.get("/rule/questions/", { params: params }).then((response) => {
            setBankQuestions(response.data.questions);
        });
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const deleteClick = (event, key) => {
        console.log("delete el", key);
        let params = {
            question_id: key,
        };
        console.log(params);
        apiInst
            .delete("/rule/question/", { params })
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchQuestions();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const editClick = (value) => {
        console.log("ed value", value);

        apiInst
            .put("/rule/question/", value)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchQuestions();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
        setModalQuestion(false);
    };

    const addClick = (value) => {
        console.log("add value", value);
        let departament = {
            text: value.text,
            answers: value.answers,
        };
        console.log(departament);
        apiInst
            .post("/rule/question/", departament)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchQuestions();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
        setAddModalQuestion(false);
    };

    return (
        <div className="container">
            <div className="row header-block">
                <div className="col-md-2">
                    <button
                        className="btn btn-primary btn-blue"
                        onClick={() => setAddModalQuestion(true)}
                    >
                        Задать новое условие
                    </button>
                    <ModalQuestion
                        isModal={isAddModalQuestion}
                        onClose={() => setAddModalQuestion(false)}
                        handleClickAdd={addClick}
                    ></ModalQuestion>
                </div>
                <div className="col-md-9">
                    <h1 className="text-center center-header">Банк уточняющих условий проведения работ</h1>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <table>
                        <tr>
                            <th>Текст условия</th>
                            <th>Ответы</th>
                            <th className="td-btn">Изменить</th>
                            <th className="td-btn">Удалить</th>
                        </tr>
                        {bankQuestions.map((question, index) => (
                            <tr key={index}>
                                <td>{question.text}</td>
                                <td>
                                    <ul>
                                        {question.answers.map(
                                            (answer, index) => (
                                                <li key={index}>
                                                    {answer.text}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </td>
                                <td className="td-btn">
                                    <button
                                        className="btn btn-primary btn-edit"
                                        onClick={() => setModalQuestion(true)}
                                    >
                                        Изменить
                                    </button>
                                    <ModalQuestion
                                        isModal={isModalQuestion}
                                        onClose={() => setModalQuestion(false)}
                                        handleClickAdd={editClick}
                                        question={question}
                                    ></ModalQuestion>
                                </td>
                                <td className="td-btn">
                                    <button className="btn btn-danger btn-red">
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </table>
                </div>
            </div>
        </div>
    );
}
