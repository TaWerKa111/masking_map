import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import MyPagination from "../../components/Pagination";
import Select from "react-select";
import send_notify from "../../utils/toast";
import FilterButton from "../forms/FilterForm";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function TypeWorksList() {
    const [typeWorks, setTypeWorks] = useState([]);
    const [departments, setDepartments] = useState([{ name: "dep1", id: 1 }]);
    const [page, setPage] = useState(1);
    const [selectedDepartaments, setSelectedDepartaments] = useState([]);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    function fetchTypeWorks() {
        let params = {
            limit: pageSize,
            page: page
        };
        apiInst
            .get("/masking/type-work/", { params })
            .then((resp) => {
                setTypeWorks(resp.data.type_works);
                setPage(resp.data.pagination.page);
                setPageSize(resp.data.pagination.limit);
                setTotalItems(resp.data.pagination.total_items);
            })
            .catch((e) => console.log(e));
    }

    useEffect(() => {
        fetchTypeWorks();
        apiInst
            .get("/masking/departament-type-work/")
            .then((resp) => {
                setDepartments(resp.data.departaments);
            })
            .catch((e) => console.log(e));
    }, []);

    const handlePageChange = (page) => {
        setPage(page);
    };

    const deleteClick = (event, key) => {
        console.log("delete el", key);
        let params = {
            type_work_id: key,
        };
        console.log(params);
        apiInst
            .delete("/masking/type-work/", { params })
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchTypeWorks();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const editClick = (value) => {
        console.log("edit el", value);
        let updateTypeWork = {
            id: value.id,
            name: value.name,
            departament_id: value.type === "" ? null : value.type,
        };
        apiInst
            .put("/masking/type-work/", updateTypeWork)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchTypeWorks();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const addClick = (value) => {
        console.log("add el", value);
        let newTypeWork = {
            name: value.name,
            departament_id: value.type,
        };
        console.log(newTypeWork);
        apiInst
            .post("/masking/type-work/", newTypeWork)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                    fetchTypeWorks();
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    const handleSelect = (data) => {
        setSelectedDepartaments(data);
        console.log("data", data);
    };

    const handleFiltered = (params) => {
        console.log("fitering type-works...", params);
        apiInst
            .get("/masking/type-work/", { params })
            .then((resp) => {
                setTypeWorks(resp.data.type_works);
                setPage(1);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md  header-list">
                    <AddElementButton
                        name={"Добавить вид работы"}
                        type_form="work"
                        types={departments}
                        onSubmit={addClick}
                    ></AddElementButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <p>
                        <h2 className="text-center">Виды работ</h2>
                    </p>
                </div>
            </div>
            <FilterButton
                onClickFiltered={handleFiltered}
                name="works"
                departaments={departments}
            ></FilterButton>
            <div className="row">
                <div className="col-md">
                    {typeWorks == null ? (
                        <p>
                            <h2>Нет видов работ!</h2>
                        </p>
                    ) : (
                        <table>
                            <tr>
                                <th>Название вида работ</th>
                                <th>Отдел</th>
                                <th>Изменить</th>
                                <th>Удалить</th>
                            </tr>
                            {typeWorks.map((typeWork) => (
                                <tr>
                                    <td>{typeWork.name}</td>
                                    <td className="td-btn">
                                        {typeWork.departament
                                            ? typeWork.departament.name
                                            : ""}
                                    </td>
                                    <td className="td-btn">
                                        <AddElementButton
                                            is_edit={true}
                                            type_form="work"
                                            className="btn btn-primary"
                                            onSubmit={editClick}
                                            name={"Изменить"}
                                            types={departments}
                                            value={typeWork}
                                        ></AddElementButton>
                                    </td>
                                    <td className="td-btn">
                                        <button
                                            className="btn btn-danger"
                                            onClick={(el) =>
                                                deleteClick(el, typeWork.id)
                                            }
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </table>
                    )}
                </div>
            </div>
            <div className="row">
                <MyPagination
                    totalItems={totalItems}
                    currentPage={page}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                ></MyPagination>
            </div>
        </div>
    );
}
