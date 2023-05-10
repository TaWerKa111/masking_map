import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import MyPagination from "../../components/Pagination";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function TypeWorks() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [typeWorks, setTypeWorks] = useState({
        typeWorks: [
            { name: "locatin1", id: 1, type: 1 },
            { name: "locatin1", id: 1 },
        ],
    });
    const [departments, setDepartments] = useState([{ name: "dep1", id: 1 }]);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        apiInst
            .get("/type-work/", { params })
            .then((resp) => {
                setTypeWorks(resp.data);
            })
            .catch((e) => console.log(e));
    }, []);

    const onClickDelete = (event, key) => {
        let params = {
            rule_id: key,
        };
        console.log(params);
        apiInst
            .delete("/rule/", (params = params))
            .then((resp) => alert(resp.result ? "Удалено" : "Не удалено"))
            .catch((e) => console.log(e));
    };

    const onClick = (event, key) => {
        let params = {
            rule_id: key,
        };
        console.log(params);
        navigate({
            pathname: `/rule/`,
            search: `?${createSearchParams(params)}`,
        });
    };

    const handlePageChange = (page) => {
        setPage(page);
    };

    const deleteClick = (event, key) => {
        console.log("delete el", key);
    };
    const editClick = (value) => {
        console.log("edit el", value);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex header-list">
                    <AddElementButton
                        name={"Добавить вид работы"}
                        type_form="work"
                        types={departments}
                    ></AddElementButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Виды работ</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <ul className="d-flex justify-content-center list-group">
                        {typeWorks == null ? (
                            <p>
                                <h2>Нет видов работ!</h2>
                            </p>
                        ) : (
                            typeWorks.typeWorks.map((typeWork) => (
                                <div
                                    key={typeWork.id}
                                    className="itemOfQuestions"
                                >
                                    <label
                                        onClick={(el) =>
                                            onClick(el, typeWork.id)
                                        }
                                    >
                                        {typeWork.name}
                                    </label>
                                    <AddElementButton
                                        is_edit={true}
                                        type_form="work"
                                        className="btn btn-primary float-end"
                                        onSubmit={editClick}
                                        name={"Изменить"}
                                        types={departments}
                                        value={typeWork}
                                    ></AddElementButton>
                                    <button
                                        className="btn btn-primary float-end"
                                        onClick={(el) =>
                                            deleteClick(el, typeWork.id)
                                        }
                                    >
                                        Удалить
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
