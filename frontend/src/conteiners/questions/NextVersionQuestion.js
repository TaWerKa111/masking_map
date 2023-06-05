import { apiInst } from "../../utils/axios";
import { useState, useEffect } from "react";
import AddElementButton from "../forms/AddElementForm";
import Select from "react-select";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function NextConditions({ handleClickAdd, selectedConditions }) {
    const [selectedQuestion, setSelectedQuestions] = useState(
        selectedConditions
            ? selectedConditions.map((condition) => ({
                  value: condition.id,
                  label: condition.text,
                  answers: condition.answers,
                  number_question: condition.number_question,
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
        setSelectedQuestions(
            data.map((d, ind) => ({ ...d, number_question: ind + 1 }))
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        handleClickAdd(selectedQuestion);
    };

    const handleChangeChekedAnswer = (event, que_id, id) => {
        console.log("question", que_id, "ans", id);
        setSelectedQuestions(
            selectedQuestion.map((question) => {
                if (question.value === que_id) {
                    console.log("question", question);
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

    function handleOnDragEnd(result) {
        console.log(result);
        if (!result.destination) return;

        const items = Array.from(selectedQuestion);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        let temp = items.map((item, ind) => ({
            ...item,
            number_question: ind + 1,
        }));
        setSelectedQuestions(temp);
    }

    console.log("selectedQuestion", selectedQuestion);
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
                            <>
                                <labe>Выберите из списка вопросы</labe>
                                <Select
                                    options={questions}
                                    placeholder="Выберите вопрос"
                                    value={selectedQuestion}
                                    onChange={handleSelect}
                                    isMulti
                                ></Select>
                                <DragDropContext onDragEnd={handleOnDragEnd}>
                                    <Droppable droppableId="characters">
                                        {(providedDrop) => (
                                            <ul
                                                {...providedDrop.droppableProps}
                                                ref={providedDrop.innerRef}
                                                className="characters"
                                            >
                                                {selectedQuestion.map(
                                                    (question, ind) => (
                                                        <Draggable
                                                            key={question.value.toString()}
                                                            draggableId={question.value.toString()}
                                                            index={ind}
                                                        >
                                                            {(provided) => (
                                                                <div
                                                                    className="list-child"
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    ref={
                                                                        provided.innerRef
                                                                    }
                                                                >
                                                                    <label>
                                                                        {
                                                                            question.number_question
                                                                        }
                                                                        .
                                                                    </label>
                                                                    <label>
                                                                        {
                                                                            question.label
                                                                        }
                                                                    </label>
                                                                    {question.answers.map(
                                                                        (
                                                                            answer
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    answer.id
                                                                                }
                                                                            >
                                                                                <label>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        name="is_right"
                                                                                        checked={
                                                                                            answer.is_right
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            handleChangeChekedAnswer(
                                                                                                e,
                                                                                                question.value,
                                                                                                answer.id
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                    {
                                                                                        answer.text
                                                                                    }
                                                                                </label>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    )
                                                )}
                                                {providedDrop.placeholder}
                                            </ul>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </>
                        )}
                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-blue"
                        >
                            Применить
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
