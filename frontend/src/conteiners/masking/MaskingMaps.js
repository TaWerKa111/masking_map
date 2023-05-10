import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import MyPagination from "../../components/Pagination";

export default function MaskingMaps() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [maskingMaps, setMaskingMaps] = useState({
        masking_maps: [
            { name: "locatin1", id: 1, type: 1 },
            { name: "locatin1", id: 1 },
        ],
    });
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        apiInst
            .get("/type-work/", { params })
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
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Карты маскирования</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <ul className="d-flex justify-content-center list-group">
                        {maskingMaps == null ? (
                            <p>
                                <h2>Нет карт маскирования!</h2>
                            </p>
                        ) : (
                            maskingMaps.masking_maps.map((maskingMap) => (
                                <div
                                    key={maskingMap.id}
                                    className="itemOfQuestions"
                                >
                                    <p>{maskingMap.name}</p>
                                    <button
                                        className="btn"
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
                    totalItems={13}
                    currentPage={page}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                ></MyPagination>
            </div>
        </div>
    );
}
