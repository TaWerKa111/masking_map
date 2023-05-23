import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";
import send_notify from "../../utils/toast";

export default function ParentLocation() {
    const [locations, setLocations] = useState([{ name: "loc1", id: 1 }]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();

    // Состояния для значений поиска
    const [searchTextOneLocation, setsearchTextOneLocation] = useState("");
    const [searchTextSecLocation, setsearchTextSecLocation] = useState("");

    const fetchLocations = (params=null) => {
        apiInst
          .get("/masking/location-list/", { params: params })
          .then((resp) => {
            setSelectedItems(resp.data.locations);
            });
    };

    // Обработчик изменения поля поиска первого списка
    const handleSearchTextOneLocationChange = (event) => {
        setsearchTextOneLocation(event.target.value);
    };

    // Обработчик изменения поля поиска второго списка
    const handleSearchTextSecLocationChange = (event) => {
        setsearchTextSecLocation(event.target.value);
    };

    // Функция для фильтрации первого списка
    const filteredListOneLocation = locations.filter((item) =>
        item.name.toLowerCase().includes(searchTextOneLocation.toLowerCase())
    );

    // Функция для фильтрации второго списка
    const filteredListSecLocation = locations.filter((item) =>
        item.name.toLowerCase().includes(searchTextSecLocation.toLowerCase())
        )
        // .sort(
        //     (a, b) => selectedItems.find(i => i.id === a.id) - selectedItems.find(i => i.id === b.id))
        ;

    useEffect(() => {
        let params = {
            limit: 100,
        };
        apiInst
            .get("/masking/location-list/", { params: params })
            .then((resp) => {
                setLocations(resp.data.locations);
            });
    }, []);

    const handleListItemClick = (item) => {
        console.log("check item", item);
        setSelectedItem(item);
        let params = {
            limit: 100,
            "parent_ids[]": [item.id],
        };
        fetchLocations(params);
        console.log("selectedItem", selectedItem);
    };

    const handleCheckboxChange = (event, item) => {
        console.log("check item", item);
        if (event.target.checked) {
            setSelectedItems([...selectedItems, item]);
        } else {
            setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
        }
    };

    const addClick = () => {
        console.log("add click", selectedItems);
        let rel_location = {
            location_id: selectedItem.id,
            location_ids: selectedItems.map((item) => item.id),
        };
        apiInst
            .post("/masking/relationship/location-location/", rel_location)
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

    console.log("locations", locations);
    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex justify-content-center header-list">
                    <p>
                        <h2>
                            Связать место проведения работ и с его компонентами
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
                    <p>Выбранное место проведения работ:</p>
                    <ul>
                        {selectedItems.map((item, index) => (
                            <li key={index}>{item.name}</li>
                        ))}
                    </ul>
                    <button className="btn btn-primary" onClick={addClick}>
                        Добавить связь
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col-md ">
                    <h2 className="text-center">Места проведения работ</h2>
                    <input
                        type="text"
                        placeholder="Название места проведения работ"
                        value={searchTextOneLocation}
                        onChange={handleSearchTextOneLocationChange}
                        className="form-control search-location"
                    />
                    <div className="list-scroll-container">
                        <ul className="list">
                            {filteredListOneLocation.map((item, index) => (
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
                    <h2 className="text-center">Места проведения работ</h2>
                    <input
                        type="text"
                        placeholder="Название места проведения работ"
                        value={searchTextSecLocation}
                        onChange={handleSearchTextSecLocationChange}
                        className="form-control search-location"
                    />
                    <div className="list-scroll-container">
                        <ul className="list">
                            {filteredListSecLocation.map((item) => (
                                <div className="check-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.find(sel_item => sel_item.id === item.id)}
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
