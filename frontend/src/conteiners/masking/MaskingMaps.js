import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import MyPagination from "../../components/Pagination";
import send_notify from "../../utils/toast";
import TableRow from "../../components/tables/TableRow";

export default function MaskingMaps() {
    const [maskingMaps, setMaskingMaps] = useState([
        {
            filename: "filename1",
            is_valid: true,
            description: "description1",
            id: 1,
        },
        {
            filename: "filename2",
            is_valid: false,
            description: "description2",
            id: 2,
        },
    ]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);

    useEffect(() => {
        let params = {};
        // apiInst
        //     .get("/masking/type-work/", { params })
        //     .then((resp) => {
        //         setMaskingMaps(resp.data.type_works);
        //         setPagination(resp.data.pagination);
        //         setPage(pagination.page);
        //     })
        //     .catch((e) => console.log(e));
        // apiInst
        //     .get("/files/get-files/", { params })
        //     .then((resp) => {
        //         setMaskingMaps(resp.data.files);
        //     })
        //     .catch((e) => console.log(e));
    }, []);

    const onClick = (el, mapUuid) => {
        apiInst({
            url: "/files/get-pdf/",
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
                send_notify("Файл успешно скачан", "success");
            })
            .catch((error) => {
                console.error(error);
                send_notify("Не удалось скачать файл", "error");
            });
    };

    const handlePageChange = (page) => {
        setPage(page);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex justify-content-center header-block">
                    <p>
                        <h2>Карты маскирования</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <ul className="d-flex justify-content-end list-group">
                        {!maskingMaps ? (
                            <p>
                                <h2 className="text-center">
                                    Нет карт маскирования!
                                </h2>
                            </p>
                        ) : (
                            <table>
                                <tr>
                                    <th className="td-ind">ID</th>
                                    <th className="">Название</th>
                                    <th className="">Описание</th>
                                    <th className="text-center td-btn">
                                        Скачать
                                    </th>
                                </tr>
                                {maskingMaps.map((maskingMap) => (
                                    <TableRow
                                        data={maskingMap}
                                        handleClick={onClick}
                                        condition={maskingMap.is_valid}
                                    ></TableRow>
                                ))}
                            </table>
                        )}
                    </ul>
                </div>
            </div>
            <div className="row">
                <MyPagination
                    totalItems={pagination.total_items}
                    currentPage={pagination.page}
                    pageSize={pagination.limit}
                    onPageChange={handlePageChange}
                ></MyPagination>
            </div>
        </div>
    );
}
