import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import send_toast from "../../utils/toast";
import ModalDescriptions from "../../components/modal/ModalDescriptions";
import Select from "react-select";

const USER_MASKING_UUID = "USER-MASKING-UUID".toLowerCase();

export default function MaskingMapV3() {
    const [isTest, setIsTest] = useState(false);
    const [cacheUuid, setCacheUuid] = useState(null);

    const [selectedTypeWorks, setSelectedTypeWorks] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedTypeLocations, setSelectedTypeLocations] = useState([]);
    const [answeredQuestions, setAnsweredQuestions] = useState([]);
    const [stageData, setStageData] = useState({});

    const [criteria, setCriteria] = useState([]);
    const [isStarted, setIsStarted] = useState(false);
    const [isModalDesriptions, setIsModalDesriptions] = useState(false);
    const [mapHtml, setMapHtml] = useState("");
    const [mapUuid, setMapUuid] = useState("");
    const [isDisabledTW, setIsDisabledTW] = useState(false);
    const [isDisabledLoc, setIsDisabledLoc] = useState(false);
    const [isDisabledTL, setIsDisabledTL] = useState(false);
    const [isDisabledQuestion, setIsDisabledQuestion] = useState([]);

    const fetchData = (tw = null, loc = null, tl = null, que = null) => {
        let params = {};
        if (tw) params.type_work_ids = tw.map((item) => item.value);
        if (loc) params.location_ids = loc.map((item) => item.value);
        if (tl) params.type_location_ids = tl.map((item) => item.value);
        if (que) params.questions = que;

        let headers = {
            USER_MASKING_UUID: cacheUuid,
        };
        apiInst
            .post("/files/generate-masking-v2/", params, { headers })
            .then((response) => {
                console.log(
                    "masking_uuid",
                    response.headers[USER_MASKING_UUID]
                );
                console.log("data", response.data);
                setCacheUuid(response.headers[USER_MASKING_UUID]);
                let temp = [];
                if (response.data.stage != "type_work") {
                    for (let item in criteria.filter(
                        (cr) => cr.stage != "result"
                    )) {
                        temp.push(criteria[item]);
                        if (
                            criteria[item].stage === response.data.stage ||
                            criteria[item].prev_stage ===
                                response.data.prev_stage ||
                            (criteria[item].stage ===
                                response.data.prev_stage &&
                                response.data.stage === "result")
                        ) {
                            break;
                        }
                    }
                }
                const table = {};
                temp.push(response.data);
                const res = temp.filter(
                    ({ stage }) => !table[stage] && (table[stage] = 1)
                );
                setCriteria(res);
                setStageData(response.data);
                if (response.data.stage === "result") {
                    if (response.data.result === true) {
                        setMapUuid(response.data.map_uuid);
                        fetchPdfDocument(response.data.map_uuid);
                        send_toast("Карта сформирована!", "success");
                    } else {
                        send_toast("Не удалось сформировать карту!", "error");
                    }
                }
            });
    };

    useEffect(() => {}, []);

    const handlerClick = () => {
        let data = {
            test: true,
        };
        let headers = {
            USER_MASKING_UUID: cacheUuid,
        };
        fetchData([]);
        setIsStarted(true);
    };

    const handlerSelectTypeWork = (data) => {
        setSelectedTypeWorks(data);
        setAnsweredQuestions([]);
        setSelectedLocations(null);
        setSelectedTypeLocations(null);
        // setStageData({});
        // fetchData(data);
        setMapHtml("");
        setMapUuid(null);
    };

    const handlerSelectLocation = (data) => {
        setSelectedLocations(data);
        setAnsweredQuestions([]);
        setSelectedTypeLocations(null);
        // setStageData({});

        // fetchData(selectedTypeWorks, data);
    };

    const handlerSelectTypeLocation = (data) => {
        setSelectedLocations(data);
        setAnsweredQuestions([]);
        // setStageData({});
    };

    const handlerSelectedAnswer = (question, answer, _criteria) => {
        console.log("questions ", question);
        let temp = [];
        if (!answeredQuestions.find((que) => question.id === que.id)) {
            console.log("No questions ", question);
            temp = [
                ...answeredQuestions,
                {
                    id: question.id,
                    answer_id: answer.id,
                },
            ];
            setAnsweredQuestions(temp);
        } else {
            let ind = answeredQuestions.findIndex((q) => q.id === question.id);
            console.log("del ind question", ind);
            temp = answeredQuestions
                .map((q) => {
                    if (q.id === question.id) {
                        return {
                            id: q.id,
                            answer_id: answer.id,
                        };
                    }
                    return q;
                })
                .filter((q, i) => i <= ind);
            setAnsweredQuestions(temp);
        }

        // let secLoc = selectedLocations;
        // if (secLoc.length === 0) secLoc = null;
        // let secTypeLoc = selectedTypeLocations;
        // if (secTypeLoc.length === 0) secTypeLoc = null;
        // fetchData(selectedTypeWorks, secLoc, secTypeLoc, temp);
        // setIsDisabledQuestion(true);
    };

    const tableRow = (_criteria) => {
        console.log("_criteria", _criteria);
        let stage = _criteria.stage;
        if (_criteria.stage.includes("question")) {
            stage = "question";
        }

        switch (stage) {
            case "type_work":
                return (
                    <tr>
                        <td colSpan={2}>
                            <label>Какой у вас вид работы?</label>
                            <Select
                                options={_criteria.criteria.type_works.map(
                                    (tw) => ({
                                        value: tw.id,
                                        label: tw.name,
                                    })
                                )}
                                placeholder="Выберите виды работ"
                                value={selectedTypeWorks}
                                onChange={handlerSelectTypeWork}
                                isMulti
                                isDisabled={isDisabledTW}
                            ></Select>
                        </td>
                    </tr>
                );
            case "location":
                return (
                    <tr>
                        <td colSpan={2}>
                            <label>Где вы проводите работу?</label>
                            <Select
                                options={_criteria.criteria.locations.map(
                                    (loc) => ({
                                        value: loc.id,
                                        label: loc.name,
                                    })
                                )}
                                placeholder="Выберите места проведения работ"
                                value={selectedLocations}
                                onChange={handlerSelectLocation}
                                isMulti
                                isDisabled={isDisabledLoc}
                            ></Select>
                        </td>
                    </tr>
                );
            case "type_location":
                return (
                    <tr>
                        {/* <td>Тип места проведения работ</td> */}
                        <td colSpan={2}>
                            <label>Где вы проводите работу?</label>
                            <Select
                                options={_criteria.criteria.locations_type.map(
                                    (loc) => ({
                                        value: loc.id,
                                        label: loc.name,
                                    })
                                )}
                                placeholder="Выберите тип места проведения работ"
                                value={selectedTypeLocations}
                                onChange={handlerSelectTypeLocation}
                                isMulti
                                isDisabled={isDisabledTL}
                            ></Select>
                        </td>
                    </tr>
                );
            case "question":
                return (
                    <tr>
                        <td colSpan={2}>
                            {_criteria.criteria.questions.map((que) => (
                                <div>
                                    <label>{que.text}</label>
                                    {que.answers.map((answer) => (
                                        <div key={answer.id} className="answer">
                                            <label className="form-check-label">
                                                <input
                                                    type="checkbox"
                                                    checked={answeredQuestions.find(
                                                        (que_ans) =>
                                                            que_ans.id ===
                                                                que.id &&
                                                            que_ans.answer_id ===
                                                                answer.id
                                                    )}
                                                    onChange={() =>
                                                        handlerSelectedAnswer(
                                                            que,
                                                            answer,
                                                            _criteria
                                                        )
                                                    }
                                                    className="form-check-input"
                                                    disabled={
                                                        isDisabledQuestion.find(
                                                            (qu) =>
                                                                qu.includes(
                                                                    `question.${que.id}`
                                                                )
                                                        )
                                                            ? "disabled"
                                                            : ""
                                                    }
                                                />
                                                {answer.text}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </td>
                    </tr>
                );
        }
    };

    const fetchPdfDocument = (
        masking_uuid = "5ca8fa4d-72f6-4031-b04b-a5c1cab61930"
    ) => {
        apiInst
            .get("/files/get-html/", {
                params: { masking_uuid: masking_uuid },
            })
            .then((resp) => {
                setMapHtml(resp.data);
            })
            .catch((e) => console.log(e));
    };

    const handleDownloadClick = () => {
        apiInst({
            url: "/files/get-pdf/", // замените на URL файла на сервере
            params: { masking_uuid: mapUuid },
            method: "GET",
            responseType: "blob", // важно указать, что ожидаем blob-данные в ответе
        })
            .then((response) => {
                const url = window.URL.createObjectURL(
                    new Blob([response.data])
                );
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "file.pdf"); // задаем имя файла для сохранения на компьютере
                document.body.appendChild(link);
                link.click();
                send_toast("Карта сформирована!", "success");
            })
            .catch((error) => {
                console.error(error);
                send_toast("Не удалось скачать файл!", "error");
            });
    };

    const handleNextClick = () => {
        switch (stageData.stage) {
            case "type_work":
                setIsDisabledTW(true);
                break;
            case "location":
                setIsDisabledLoc(true);
                break;
            case "type_location":
                setIsDisabledTL(true);
                break;
            default:
                if (stageData.stage.includes("question")) {
                    setIsDisabledQuestion([
                        ...isDisabledQuestion,
                        stageData.stage,
                    ]);
                }
                break;
        }

        fetchData(
            selectedTypeWorks,
            selectedLocations,
            selectedTypeLocations,
            answeredQuestions
        );
        // setStageData({});
    };

    console.log("selectedTypeWorks", selectedTypeWorks);
    console.log("answeredQuestions", answeredQuestions);
    console.log("criteria", criteria);
    console.log("stageData", stageData);
    console.log("isDisabledQuestion", isDisabledQuestion);

    return (
        <div className="container">
            <div className="row">
                <div className="col-md header-block">
                    <h1 className="text-center center-header">
                        Заполните анкету
                    </h1>
                    <p>
                        Для того, чтобы начать формировать карту необходимо
                        нажать на кнопку <strong>"Начать"</strong>. На странице
                        будут появляться вопросы на которые необходимо ответить.
                        Где-то будут выпадающие списка, из них нужно будут
                        выбрать подходящий, а где-то полноценные вопросы с
                        вариантами ответов, в которых нужно будут выбрать один.{" "}
                        <br /> Настройка
                        <strong> "Тестовый запрос"</strong> используется для
                        тестирования, проверок.
                        <br /> Алгоритм версии: 0.2
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <div class="form-check form-switch">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="flexSwitchCheckDefault"
                            checked={isTest}
                            onChange={(e) => setIsTest(e.target.checked)}
                        />
                        <label
                            class="form-check-label text-check-label"
                            for="flexSwitchCheckDefault"
                        >
                            Тестовый запрос
                        </label>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <table>
                        {criteria.length > 0 ? (
                            <>{criteria.map((cr) => tableRow(cr))}</>
                        ) : (
                            <></>
                        )}
                    </table>
                </div>
            </div>
            {stageData.stage === "result" ? (
                <div className="row">
                    <div className="col-md">
                        <h2>Описание карты маскирования</h2>
                        <p>{stageData.description}</p>
                        <button
                            className="btn btn-full btn-primary btn-blue"
                            onClick={() => setIsModalDesriptions(true)}
                        >
                            Показать окно с протоколом формирования карты
                        </button>
                        <ModalDescriptions
                            onClose={() => setIsModalDesriptions(false)}
                            descriptions={stageData.logic_machine_answer}
                            isModal={isModalDesriptions}
                        ></ModalDescriptions>
                    </div>
                </div>
            ) : (
                <> </>
            )}
            {stageData.stage === "result" && stageData.result === true ? (
                <div>
                    <div className="row">
                        <div className="col-md">
                            <iframe
                                title="MAP"
                                srcDoc={mapHtml}
                                style={{
                                    width: "100%",
                                    height: "80vh",
                                    border: "1px solid black",
                                    borderRadius: "5px",
                                }}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md">
                            <h2>Сопровождающие мероприятия</h2>
                            <p>{stageData.compensatory_measures}</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md d-flex justify-content-center">
                            <button
                                className="downloadButton btn-blue"
                                onClick={handleDownloadClick}
                            >
                                Скачать файл
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div></div>
            )}
            <button
                className="btn btn-submit btn-full btn-blue"
                onClick={handlerClick}
                style={isStarted ? { display: "none" } : { display: "inline" }}
            >
                Начать
            </button>
            <button
                className="btn btn-submit btn-full btn-blue"
                onClick={handleNextClick}
                style={
                    isStarted && stageData.stage != "result"
                        ? { display: "inline" }
                        : { display: "none" }
                }
            >
                Далее
            </button>
        </div>
    );
}
