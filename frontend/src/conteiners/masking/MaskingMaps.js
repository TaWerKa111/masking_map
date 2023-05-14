import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import MyPagination from "../../components/Pagination";

export default function MaskingMaps() {
    const [maskingMaps, setMaskingMaps] = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);

    useEffect(() => {
        let params = {};
        apiInst
            .get("/type-work/", { params })
            .then((resp) => {
                setMaskingMaps(resp.data.files);
                setPagination(resp.data.pagination);
                setPage(pagination.page);
            })
            .catch((e) => console.log(e));
        apiInst
            .get("/files/get-file/", { params })
            .then((resp) => {
                setMaskingMaps(resp.data);
            })
            .catch((e) => console.log(e));
    }, []);

    const onClick = (el, key) => {};

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
                        {maskingMaps ? (
                            <p>
                                <h2 className="text-center">
                                    Нет карт маскирования!
                                </h2>
                            </p>
                        ) : (
                            maskingMaps.map((maskingMap) => (
                                <div
                                    key={maskingMap.id}
                                    className="item-of-list"
                                >
                                    <label>{maskingMap.name}</label>
                                    <button
                                        className="btn btn-primary float-end"
                                        onClick={(el) =>
                                            onClick(el, maskingMap.id)
                                        }
                                    >
                                        Скачать
                                    </button>
                                </div>
                            ))
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
