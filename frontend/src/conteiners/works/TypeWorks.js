import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import MyPagination from "../../components/Pagination";
import Select from 'react-select';

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
    const [selectedDepartaments, setSelectedDepartaments] = useState([]);
    const pageSize = 10;

    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        apiInst
            .get("/masking/type-work/", { params })
            .then((resp) => {
                setTypeWorks(resp.data);
            })
            .catch((e) => console.log(e));
        apiInst
            .get("/masking/departament-type-work/", { params })
            .then((resp) => {
                setDepartments(resp.data);
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
    const addClick = (value) => {
        console.log("edit el", value);
    };

    const optionList = [
        { value: "red", label: "Red" },
        { value: "green", label: "Green" },
        { value: "yellow", label: "Yellow" },
        { value: "blue", label: "Blue" },
        { value: "white", label: "White" }
    ];

    const handleSelect =(data) => {
        setSelectedDepartaments(data);
        console.log("data", data);
    }

    const handleFiltered = () => {
        console.log("fitering type-works...");
        apiInst.get();
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex header-list">
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
                    <div className="d-flex">
                        <label>
                            Фильтры
                        </label>
                        <div className="">
                            <label>
                                Название
                            </label>
                            <input type="text">
                            </input>
                        </div>
                        <div>
                            <label>
                                Отдел
                            </label>
                            <Select
                                options={optionList}
                                placeholder="Select color"
                                value={selectedDepartaments}
                                onChange={handleSelect}
                                isMulti
                            >
                            </Select>
                        </div>
                        <button className="btn btn-primary" onClick={handleFiltered}>
                            Применить фильтры
                        </button>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                {typeWorks == null ? (
                            <p>
                                <h2>Нет видов работ!</h2>
                            </p>
                        ): (
                            <table>
                                <tr>
                                    <th>Название</th>
                                    <th>Отдел</th>
                                    <th>Правила</th>
                                    <th>Изменить</th>
                                    <th>Удалить</th>
                                </tr>{
                            typeWorks.typeWorks.map((typeWork) => (
                                <tr>
                                    <td>{typeWork.name}</td>
                                    <td></td>
                                    <td></td>
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
                                            className="btn btn-primary"
                                            onClick={(el) =>
                                                deleteClick(el, typeWork.id)
                                            }
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))
                            }
                            </table>
                        )}
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
