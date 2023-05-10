import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import ModalTypeWork from "../../components/modal/ModalTypeWork";
import ModalLocation from "../../components/modal/ModalLocation";
import { type } from "@testing-library/user-event/dist/type";
import ModalChoiceConditions from "../../components/modal/ModalChoiceConditions";

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
    const [conditions, setConditions] = useState([
        {
            name: "name1",
            id: 1,
            answers: [
                { name: 1, id: 1 },
                { name: 2, id: 2 },
            ],
        },
    ]);

    useEffect(() => {
        let params = {};
    }, []);

    const handleTypeWorks = (selectedTypeWorks) => {
        console.log("type_works", typeWorks);
        setModalTypeWork(false);
        setTypeWorks(selectedTypeWorks);
    };

    const handleLocations = (locations) => {
        console.log("locations", locations);
        setModalLocation(false);
        setLocations(locations);
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

    if (resultGenerating.result === true) {
        return (
            <div className="container">
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
        );
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <h1>Заполните анкету</h1>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <label>Виды работ:</label>
                </div>
                <div className="col-md">
                    <p>Виды работ:</p>
                    <ul>
                        {typeWorks.map((work) => (
                            <p key={work.id}>{work.name}</p>
                        ))}
                    </ul>
                    <button onClick={() => setModalTypeWork(true)}>
                        Изменить
                    </button>
                    <ModalTypeWork
                        isModal={isModalTypeWork}
                        onClose={() => setModalTypeWork(false)}
                        handleClickAdd={handleTypeWorks}
                        works={typeWorks}
                    ></ModalTypeWork>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <label>Локации:</label>
                </div>
                <div className="col-md">
                    <p>Локации:</p>
                    <ul>
                        {locations.map((location) => (
                            <p key={location.id}>{location.name}</p>
                        ))}
                    </ul>
                    <button onClick={() => setModalLocation(true)}>
                        Изменить
                    </button>
                    <ModalLocation
                        isModal={isModalLocation}
                        onClose={() => setModalLocation(false)}
                        handleClickAdd={handleLocations}
                        locations={locations}
                    ></ModalLocation>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <label>Условия:</label>
                </div>
                <div className="col-md">
                    <p>Условия:</p>
                    <ul>
                        {conditions.map((condition) => (
                            <p key={condition.id}>{condition.name}</p>
                        ))}
                    </ul>
                    <button onClick={() => setModalCondition(true)}>
                        Изменить
                    </button>
                    <ModalChoiceConditions
                        isModal={isModalCondition}
                        onClose={() => setModalCondition(false)}
                        handleClickAdd={handleConditions}
                        conditions={conditions}
                    ></ModalChoiceConditions>
                </div>
            </div>
            <div className="row">
                <div className="col-md"></div>
            </div>
            <div className="row">
                <div className="col-md">
                    <button>Сформировать карту</button>
                </div>
            </div>
        </div>
    );
}
