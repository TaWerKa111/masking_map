import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";

export default function ChoiceProtections({ selProtections, handleClickAdd }) {
    const [locations, setLocations] = useState([{ name: "asd", id: 1 }]);
    const [protections, setProtections] = useState([
        { name: "123", id: 1, is_masking: true },
    ]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedProtections, setSelectedProtections] =
        useState(selProtections);
    const navigate = useNavigate();

    // Состояния для значений поиска
    const [searchTextLocation, setSearchTextLocation] = useState("");
    const [searchTextProtection, setSearchTextProtection] = useState("");

    useEffect(() => {
        let params = {
            limit: 100,
        };
        apiInst
            .get("/masking/location-list/", { params: params })
            .then((resp) => {
                setLocations(resp.data.locations);
            });
        let protectionParams = {};
        apiInst
            .get("/masking/protection/", { protectionParams })
            .then((resp) => {
                setProtections(resp.data.protections);
            });
    }, []);

    // Обработчик изменения поля поиска первого списка
    const handleSearchTextLocationChange = (event) => {
        setSearchTextLocation(event.target.value);
    };

    // Обработчик изменения поля поиска второго списка
    const handleSearchTextProtectionChange = (event) => {
        setSearchTextProtection(event.target.value);
    };

    // Функция для фильтрации первого списка
    const filteredListLocation = locations.filter((item) =>
        item.name.toLowerCase().includes(searchTextLocation.toLowerCase())
    );

    // Функция для фильтрации второго списка
    const filteredListProtection = protections.filter((item) =>
        item.name.toLowerCase().includes(searchTextProtection.toLowerCase())
    );

    const handleListItemClick = (item) => {
        console.log("check item", item);
        setSelectedItem(item);
        console.log("selectedItem", selectedItem);
    };

    const handleCheckboxChange = (event, item) => {
        if (event.target.checked) {
            setSelectedProtections([...selectedProtections, item]);
        } else {
            setSelectedProtections(
                selectedProtections.filter((i) => i.id !== item.id)
            );
        }
    };

    const handleClickChoiceProtection = () => {
        let indexes = [];
        selectedProtections.forEach((item) => indexes.push(item.id));
        let params = {
            protection_ids: indexes,
        };

        let pathname = "/expert/add-rule/";

        navigate({
            pathname: pathname,
            search: createSearchParams(params).toString(),
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        handleClickAdd(selectedProtections);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <form onSubmit={handleSubmit}>
                        <p>Выбранные защиты:</p>
                        <ul className="list-group">
                            {selectedProtections.map((item, index) => (
                                <li className="list-group-item" key={index}>
                                    {item.name}
                                </li>
                            ))}
                        </ul>
                    </form>
                </div>
            </div>
            <div className="row">
                <div className="col-md ">
                    <label htmlFor="exampleFormControlSelect1">
                        Введите название защиты
                    </label>
                    <input
                        type="text"
                        placeholder="Название защиты"
                        value={searchTextProtection}
                        onChange={handleSearchTextProtectionChange}
                        className="form-control"
                    />
                    <div className="list-scroll-container">
                        <ul className="list-protection">
                            {filteredListProtection.map((item) => (
                                <div>
                                    <label
                                        class="form-check-label protection-label"
                                        // for="flexCheckDefault"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedProtections.filter(
                                                    (i) => i.id == item.id
                                                ).length > 0
                                            }
                                            onChange={(event) =>
                                                handleCheckboxChange(
                                                    event,
                                                    item
                                                )
                                            }
                                            class="form-check-input"
                                            value=""
                                            id="flexCheckDefault"
                                        ></input>

                                        {item.name}
                                    </label>
                                </div>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <button
                onClick={handleSubmit}
                type="submit"
                className="btn btn-primary btn-full"
            >
                Применить
            </button>
        </div>
    );
}
