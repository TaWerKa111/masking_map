import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import ModalTypeWork from "../../components/modal/ModalTypeWork";
import ModalLocation from "../../components/modal/ModalLocation";
import { type } from "@testing-library/user-event/dist/type";
import ModalChoiceConditions from "../../components/modal/ModalChoiceConditions";
import send_toast from "../../utils/toast";
import ModalDescriptions from "../../components/modal/ModalDescriptions";
import ModalQuestioinLocation from "../../components/modal/ModalQuestioinLocation";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function MaskingMap() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [resultGenerating, setResultGenerating] = useState({
        description: [],
        logic_machine_answer: [],
    });
    const [mapHtml, setMapHtml] = useState("");
    const [mapUuid, setMapUuid] = useState("");

    const [isModalTypeWork, setModalTypeWork] = useState(false);
    const [isModalLocation, setModalLocation] = useState(false);
    const [isModalCondition, setModalCondition] = useState(false);
    const [locations, setLocations] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [typeLocationList, setTypeLocationList] = useState([]);
    const [typeWorks, setTypeWorks] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [styleBtn, setStyleBtn] = useState({
        display: "block",
    });
    const [isTest, setIsTest] = useState(false);
    const [questionDescriptions, setQuestionDescriptions] = useState([]);
    const [isModalDesriptions, setIsModalDesriptions] = useState(false);
    const [typeLocations, setTypeLocations] = useState([]);

    // const [selectedConditions, setSelectedConditions] = useState([]);
    const fetchQuestions = (type_works = null, location_list = null, type_location_list = null) => {
        let tw = null;
        let loc = null;
        let tl = null;
        if (type_works) {
            tw = type_works.map((typeWork) => typeWork.id);
        }
        if (location_list) {
            loc = location_list.map((location) => location.id);
        }
        if (type_location_list) {
            tl = type_location_list.map((location) => location.id);
        }
        let params = {
            "type_work_ids[]": tw,
            "location_ids[]": loc,
            "type_location_ids[]": tl,
        };
        console.log("questions params", params);
        apiInst
            .get("/rule/filter-question-rule/", { params })
            .then((resp) => {
                setConditions(resp.data.questions);
                setQuestionDescriptions(resp.data.descriptions);
            })
            .catch((err) => {
                console.log(err);
            });
    };
    const styleTdName = { width: "28%" };

    const fetchLocations = (type_works = null) => {
        let tw = null;
        let loc = null;
        if (type_works) {
            tw = type_works.map((typeWork) => typeWork.id);
        }
        let params = {
            "type_work_ids[]": tw,
        };
        apiInst
            .get("/masking/location-list/", { params })
            .then((resp) => {
                setLocationList(resp.data.locations);
            })
            .catch((e) => console.log(e));
    }

    const fetchTypeLocations = (type_works = null) => {
        let tw = null;
        let loc = null;
        if (type_works) {
            tw = type_works.map((typeWork) => typeWork.id);
        }
        let params = {
            "type_work_ids[]": tw,
        };
        apiInst
            .get("/masking/type-location/", { params: params })
            .then((resp) => {
                setTypeLocationList(resp.data);
            })
            .catch((e) => console.log(e));
    }

    useEffect(() => {
        // fetchQuestions();
    }, []);

    const handleTypeWorks = (selectedTypeWorks) => {
        console.log("type_works", typeWorks);
        setModalTypeWork(false);
        setTypeWorks(selectedTypeWorks);
        fetchQuestions(selectedTypeWorks, locations, typeLocations);
        fetchLocations(selectedTypeWorks);
        fetchTypeLocations(selectedTypeWorks);
    };

    const handleLocations = (locations, typeLocationsList) => {
        console.log("locations", locations);
        setModalLocation(false);
        setLocations(
            // locations.map((location) => ({
            //     name: location.label,
            //     id: location.value,
            // }))
            locations
        );
        setTypeLocations(typeLocationsList);
        fetchQuestions(
            typeWorks,
            locations.map((location) => ({
                name: location.label,
                id: location.value,
            })),
            typeLocationsList
        );
    };

    const handleConditions = (selectedConditions) => {
        console.log("selectedConditions", selectedConditions);
        setModalCondition(false);
        setConditions(selectedConditions);
    };

    const params = {
        id_type_work: searchParams.get("type_work_id"),
        id_object: searchParams.get("mn_object_id"),
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

    const handleGenerateMap = () => {
        // setResultGenerating({});
        if ( typeWorks.length === 0)
        {
            send_toast("Заполните вид работ и место проведения", "error");
            return;
        }
        let generateMapData = {
            locations: locations,
            type_works: typeWorks,
            questions: conditions,
            is_test: isTest,
        };
        console.log("generateMapData", generateMapData);
        apiInst
            .post("/files/generate-masking/", generateMapData)
            .then((resp) => {
                setResultGenerating(resp.data);
                setMapUuid(resp.data.masking_uuid);
                fetchPdfDocument(resp.data.masking_uuid);
                send_toast("Карта сформирована!", "success");
                setStyleBtn({
                    display: "none",
                });
            })
            .catch((err) => {
                console.log(err);
                send_toast("Не удалось сформировать карту!", "error");
                setResultGenerating(err.response.data);
            });
    };

    console.log("result", resultGenerating);
    console.log("desc qestions", questionDescriptions);
    console.log("locationList", locationList);
    return (
        <div className="container">
            <div className="row">
                <div className="col-md header-block">
                    <h1 className="text-center center-header">
                        Заполните анкету
                    </h1>
                    <p>
                        Для заполнения отдельных блоков необходимо нажимать
                        кнопку <strong>"Изменить"</strong> и в появившемся окне необходимо
                        выбрать соответсвующие пункты. <br /> Настройка
                        <strong> "Тестовый запрос"</strong> используется для
                        тестирования, проверок.
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
                <table>
                    <tr>
                        <td style={styleTdName}>
                            <div className="d-flex h3 justify-content-center align-items-center">
                                <label>Виды работ:</label>
                            </div>
                        </td>
                        <td>
                            <label className="h6">Выбраные виды работ:</label>

                            <ul>
                                {typeWorks.map((work) => (
                                    <p key={work.id}>{work.name}</p>
                                ))}
                            </ul>

                            <ModalTypeWork
                                isModal={isModalTypeWork}
                                onClose={() => setModalTypeWork(false)}
                                handleClickAdd={handleTypeWorks}
                                works={typeWorks}
                            ></ModalTypeWork>
                        </td>
                        <td className="td-btn">
                            <div className="d-flex justify-content-center">
                                <button
                                    className="btn btn-primary btn-edit float-end"
                                    onClick={() => setModalTypeWork(true)}
                                    style={styleBtn}
                                >
                                    Изменить
                                </button>
                            </div>
                        </td>
                    </tr>
                    {
                        locationList.length > 0 || typeLocationList.length > 0 ?
                        (                    <tr>
                            <td style={styleTdName}>
                                <div className="d-flex h3 justify-content-center align-items-center">
                                    <label>Места проведения работ:</label>
                                </div>
                            </td>
                            <td>
                                <label className="h6">
                                    Выбранные места проведения работ:
                                </label>
    
                                <ul>
                                    {locations.map((location) => (
                                        <p key={location.id}>{location.name}</p>
                                    ))}
                                </ul>
                                <ModalQuestioinLocation
                                    isModal={isModalLocation}
                                    onClose={() => setModalLocation(false)}
                                    handleClickAdd={handleLocations}
                                    locations={locationList}
                                    type_locations={typeLocationList}
                                ></ModalQuestioinLocation>
                            </td>
                            <td className="td-btn">
                                <div className="d-flex justify-content-center">
                                    <button
                                        className="btn btn-primary btn-edit"
                                        onClick={() => setModalLocation(true)}
                                        style={styleBtn}
                                    >
                                        Изменить
                                    </button>
                                </div>
                            </td>
                        </tr>)
                        : <></>
                    }

                    {(locations.length > 0 || locationList.lenght === 0) || (typeLocationList.length === 0 || typeLocations.lenght > 0) && conditions.length > 0 ? (
                        <tr>
                            <td style={styleTdName}>
                                <div className="d-flex h3 justify-content-center align-items-center">
                                    <label>Условия:</label>
                                </div>
                            </td>
                            <td>
                                <label className="h6">Условия:</label>
                                <ul>
                                    {conditions.map((condition) => (
                                        <div>
                                            <label key={condition.id}>
                                                {condition.text}
                                            </label>
                                            <label>
                                                {condition.answer_id
                                                    ? condition.answers.filter(
                                                          (item) =>
                                                              item.id ===
                                                              condition.answer_id
                                                      )[0].text
                                                    : "нет ответа"}
                                            </label>
                                        </div>
                                    ))}
                                </ul>
                                <ModalChoiceConditions
                                    isModal={isModalCondition}
                                    onClose={() => setModalCondition(false)}
                                    handleClickAdd={handleConditions}
                                    conditions={conditions}
                                ></ModalChoiceConditions>
                            </td>
                            <td className="td-btn">
                                <div className="d-flex justify-content-center">
                                    <button
                                        className="btn btn-primary btn-edit float-end"
                                        onClick={() => setModalCondition(true)}
                                        style={styleBtn}
                                    >
                                        Изменить
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        <></>
                    )}
                </table>
            </div>

            {questionDescriptions.length > 0 ? (
                <div className="row">
                    <div className="col-md">
                        <label>Промежуточные правила при выборе условий</label>
                        <ul>
                            {questionDescriptions.map((description) => (
                                <li>{description}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <> </>
            )}
            {resultGenerating.logic_machine_answer.length > 0 ? (
                <div className="row">
                    <div className="col-md">
                        <h2>Описание карты маскирования</h2>
                        <p>{resultGenerating.description}</p>
                        <button
                            className="btn btn-full btn-primary btn-blue"
                            onClick={() => setIsModalDesriptions(true)}
                        >
                            Показать окно с протоколом формирования карты
                        </button>
                        <ModalDescriptions
                            onClose={() => setIsModalDesriptions(false)}
                            descriptions={resultGenerating.logic_machine_answer}
                            isModal={isModalDesriptions}
                        ></ModalDescriptions>
                    </div>
                </div>
            ) : (
                <> </>
            )}
            {resultGenerating.result ? (
                <div>
                    <div className="row">
                        <div className="col-md">
                            <iframe
                                title="MAP"
                                srcDoc={mapHtml}
                                style={{ width: "100%", height: "100vh" }}
                            />
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
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <button
                        onClick={handleGenerateMap}
                        className="btn btn-primary btn-generate"
                    >
                        Сформировать карту
                    </button>
                </div>
            </div>
        </div>
    );
}
