import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../utils/axios";


const URL = "http:localhost:5001/api/masking/get-file/";

export default function MaskingMap () {
    const [searchParams, setSearchParams] = useSearchParams();
    const [resultGenerating, setResultGenerating] = useState({});
    const [mapHtml, setMapHtml] = useState('');
    const [mapUuid, setMapUuid] = useState('');
    

    const params = {
        id_type_work: searchParams.get("type_work_id"),
        id_object: searchParams.get("mn_object_id")
    };

    const fetchPdfDocument = (masking_uuid='5ca8fa4d-72f6-4031-b04b-a5c1cab61930') => {
        apiInst
            .get('/masking/get-html/', { params: {"masking_uuid": masking_uuid}})
            .then(resp => {setMapHtml(resp.data)})
            .catch(e => console.log(e));
      };

    useEffect(() => {
        let res_result = true;
        apiInst
            .get("/masking/generate-masking/", {params})
            .then((resp) => {
                setResultGenerating(resp.data);
                res_result=resp.data.result;
            })
            .catch(e => console.log(e));
            
        if (res_result === true) {
            console.log(res_result);
            setMapUuid(resultGenerating.masking_uuid);
            fetchPdfDocument();
        }

    }, [])

    const handleDownloadClick = () => {
        apiInst({
            url: '/masking/get-pdf/', // замените на URL файла на сервере
            params: {masking_uuid: mapUuid},
            method: 'GET',
            responseType: 'blob', // важно указать, что ожидаем blob-данные в ответе
        })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'file.pdf'); // задаем имя файла для сохранения на компьютере
                document.body.appendChild(link);
                link.click();
            })
            .catch((error) => {
                console.error(error);
            });
    }


    if (resultGenerating.result === true) {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md">
                    <iframe title="MAP" srcDoc={mapHtml} style={{ width: '100%', height: '100vh' }}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md d-flex justify-content-center">
                        <button className="downloadButton" onClick={handleDownloadClick}>Скачать файл</button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            Не удалось сформировать файл!
        </div>
    )

}
