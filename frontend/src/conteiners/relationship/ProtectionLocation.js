import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import send_notify from "../../utils/toast";

export default function LocationProtection() {
    const [locations, setLocations] = useState([{ name: "asd", id: 1 }]);
    const [protections, setProtections] = useState([{ name: "123", id: 1 }]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedProtections, setSelectedProtections] = useState([]);
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
                selectedProtections.filter((i) => i !== item)
            );
        }
    };

    const addClick = () => {
        let rel_protection = {
            location_id: selectedItem.id,
            protection_ids: selectedProtections.map((item) => item.id),
        };
        console.log("rel_prot", rel_protection);
        apiInst
            .post("/masking/relationship/location-protection/", rel_protection)
            .then((resp) => {
                if (resp.data.result) {
                    send_notify(resp.data.message, "success");
                } else send_notify(resp.data.message, "error");
            })
            .catch((e) => {
                send_notify(e.response.data.message, "error");
                console.log(e.response.data.message);
            });
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex justify-content-center header-list">
                    <p>
                        <h2 className="center-header header-block">
                            Связать место проведения работ и с его защитами
                        </h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <p>
                        Выбранное место проведения работ:{" "}
                        {selectedItem ? selectedItem.name : ""}
                    </p>
                    <p>Выбранные защиты:</p>
                    <ul>
                        {selectedProtections.map((item, index) => (
                            <li key={index}>{item.name}</li>
                        ))}
                    </ul>
                    <button
                        className="btn btn-primary btn-blue"
                        onClick={addClick}
                    >
                        Добавить связь
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col-md ">
                    <h2 className="text-center">Места проведения работ</h2>
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={searchTextLocation}
                        onChange={handleSearchTextLocationChange}
                        className="form-control search-location"
                    />
                    <div className="list-scroll-container">
                        <ul className="list">
                            {filteredListLocation.map((item, index) => (
                                <div
                                    className="check-item"
                                    onClick={() => handleListItemClick(item)}
                                >
                                    {item.name}
                                </div>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-md ">
                    <h2 className="text-center">Защиты</h2>
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={searchTextProtection}
                        onChange={handleSearchTextProtectionChange}
                        className="form-control search-location"
                    />
                    <div className="list-scroll-container">
                        <ul className="list">
                            {filteredListProtection.map((item) => (
                                <div className="check-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedProtections.includes(
                                            item
                                        )}
                                        onChange={(event) =>
                                            handleCheckboxChange(event, item)
                                        }
                                        className="form-check-input check-location"
                                    />
                                    {item.name}
                                </div>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
