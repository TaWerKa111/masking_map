import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import ModalTypeWork from "../../components/modal/ModalTypeWork";
import ModalLocation from "../../components/modal/ModalLocation";
import { type } from "@testing-library/user-event/dist/type";
import ModalChoiceConditions from "../../components/modal/ModalChoiceConditions";
import send_toast from "../../utils/toast";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function MaskingMap() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [resultGenerating, setResultGenerating] = useState({});
    const [mapHtml, setMapHtml] = useState("");
    const [mapUuid, setMapUuid] = useState("");

    const [isModalTypeWork, setModalTypeWork] = useState(false);
    const [isModalLocation, setModalLocation] = useState(false);
    const [isModalCondition, setModalCondition] = useState(false);
    const [locations, setLocations] = useState([]);
    const [typeWorks, setTypeWorks] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [styleBtn, setStyleBtn] = useState({
        display: "block"
    });

    // const [selectedConditions, setSelectedConditions] = useState([]);
    const fetchQuestions = () => {
        apiInst
            .get("/rule/questions/")
            .then((resp) => {
                setConditions(resp.data.questions);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleTypeWorks = (selectedTypeWorks) => {
        console.log("type_works", typeWorks);
        setModalTypeWork(false);
        setTypeWorks(selectedTypeWorks);
        fetchQuestions();
    };

    const handleLocations = (locations) => {
        console.log("locations", locations);
        setModalLocation(false);
        setLocations(locations);
        fetchQuestions();
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
            .get("/masking/get-html/", {
                params: { masking_uuid: masking_uuid },
            })
            .then((resp) => {
                setMapHtml(resp.data);
            })
            .catch((e) => console.log(e));
    };

    const handleDownloadClick = () => {
        apiInst({
            url: "/masking/get-pdf/", // замените на URL файла на сервере
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
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleGenerateMap = () => {
        setResultGenerating({});
        let generateMapData = {
            locations: locations,
            type_works: typeWorks,
            conditions: conditions,
        };
        console.log("generateMapData", generateMapData);
        apiInst
            .get("/files/generate-masking/", {
                params: params,
            })
            .then((resp) => {
                setResultGenerating(resp.data);
                setMapUuid(resp.data.masking_uuid);
                // fetchPdfDocument(resp.data.masking_uuid);
                send_toast("Карта сформирована!", "error");
                setStyleBtn({
                    display: "none"
                });
            })
            .catch((err) => {
                console.log(err);
                send_toast("Не удалось сформировать карту!", "error");
            });
        setStyleBtn({
            display: "none"
        });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md header-block">
                    <h1 className="text-center ">Заполните анкету</h1>
                    <p>
                        Для заполнения отдельных блоков необходимо нажимать
                        кнопку "Изменить" и в появившемся окне необходимо
                        выбрать соответсвующие пункты.
                    </p>
                </div>
            </div>
            <div className="row">
                <table>
                    <tr>
                        <td>
                            <div className="d-flex h3 justify-content-center align-items-center">
                                <label>Виды работ:</label>
                            </div>
                        </td>
                        <td>
                            <label className="h6">Виды работ:</label>
                            <button
                                className="btn btn-secondary float-end"
                                onClick={() => setModalTypeWork(true)}
                                style={styleBtn
                                }
                            >
                                Изменить
                            </button>
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
                    </tr>
                    <tr>
                        <td>
                            <div className="d-flex h3 justify-content-center align-items-center">
                                <label>Локации:</label>
                            </div>
                        </td>
                        <td>
                            <label className="h6">Локации:</label>
                            <button
                                className="btn btn-secondary float-end"
                                onClick={() => setModalLocation(true)}
                                style={styleBtn}
                            >
                                Изменить
                            </button>
                            <ul>
                                {locations.map((location) => (
                                    <p key={location.id}>{location.name}</p>
                                ))}
                            </ul>

                            <ModalLocation
                                isModal={isModalLocation}
                                onClose={() => setModalLocation(false)}
                                handleClickAdd={handleLocations}
                                locations={locations}
                            ></ModalLocation>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className="d-flex h3 justify-content-center align-items-center">
                                <label>Условия:</label>
                            </div>
                        </td>
                        <td>
                            <label className="h6">Условия:</label>
                            <button
                                className="btn btn-secondary float-end"
                                onClick={() => setModalCondition(true)}
                                style={styleBtn}
                            >
                                Изменить
                            </button>
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
                    </tr>
                </table>
            </div>
                {
                    resultGenerating.result ?
                    (
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
                                        className="downloadButton"
                                        onClick={handleDownloadClick}
                                    >
                                        Скачать файл
                                    </button>
                                </div>
                            </div>
                        </div> 
                    )
                    : <div></div>
                }
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <button
                        onClick={handleGenerateMap}
                        className="btn btn-primary"
                    >
                        Сформировать карту
                    </button>
                </div>
            </div>
        </div>
    );
}
