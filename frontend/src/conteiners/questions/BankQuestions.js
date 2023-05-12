import { useEffect, useState } from "react"
import { apiInst } from "../../utils/axios"
import ModalQuestion from "../../components/modal/ModalQuestion";

export default function BankQuestions () {
    const [bankQuestions, setBankQuestions] = useState([])
    const [isModalQuestion, setModalQuestion] = useState(false);

    useEffect(() => {
        apiInst.get('/api/bank-questions')
            .then(response => {
                setBankQuestions(response.data.questions)
            })
          // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleQuestion = (question) => {
        console.log("question", question);
        let temp = Object.assign([], bankQuestions);
        temp.push(question);
        setBankQuestions(
            temp
        );
        setModalQuestion(false);
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-1">
                    <button className="btn btn-primary" onClick={() => setModalQuestion(true)}>Создать новый</button>
                    <ModalQuestion
                        isModal={isModalQuestion}
                        onClose={() => setModalQuestion(false)}
                        handleClickAdd={handleQuestion}
                    ></ModalQuestion>
                </div>
                <div className="col-md-11">
                    <h1 className="text-center">Банк вопросов</h1>
                </div>
                
            </div>
            <div className="row">
                <div className="col-md-12">
                    <table>
                        <tr>
                            <th>Вопрос</th>
                            <th>Ответы</th>
                            <th className="td-btn">Изменить</th>
                            <th className="td-btn">Удалить</th>
                        </tr>
                        {
                            bankQuestions.map((question, index) => (
                            <tr key={index}>
                                <td>{question.name}</td>
                                <td>
                                    <ul>
                                        {
                                            question.answers.map((answer, index) => (
                                                <li key={index}>{answer.name}</li>
                                            ))
                                        }
                                    </ul>
                                </td>
                                <td className="td-btn"><button className="btn btn-primary" onClick={() => setModalQuestion(true)}>Изменить</button>
                                    <ModalQuestion 
                                        isModal={isModalQuestion} 
                                        onClose={() => setModalQuestion(false)} 
                                        handleClickAdd={handleQuestion}
                                        question={question}
                                    ></ModalQuestion>
                                </td>
                                <td className="td-btn"><button className="btn btn-danger">Удалить</button></td>
                            </tr>
                            ))
                        }
                    </table>
                </div>
            </div>
        </div>
    )
}
