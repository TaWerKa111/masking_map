import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";

export default function ParentLocation() {
    const [locations, setLocations] = useState([{ name: "loc1", id: 1 }]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();

    // Состояния для значений поиска
    const [searchTextOneLocation, setsearchTextOneLocation] = useState("");
    const [searchTextSecLocation, setsearchTextSecLocation] = useState("");

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
    );

    useEffect(() => {
        let params = {};
        // apiInst
        //     .get("/locations/", {params})
        //     .then((resp) => {
        //         setLocations(resp.data);
        //     })
        //     .catch(e => console.log(e));
        let l = [];
        for (let i = 0; i < 30; i++) {
            l.push({ name: `loc${i}`, id: 1 });
        }
        setLocations(l);
    }, []);

    const handleListItemClick = (item) => {
        console.log("check item", item);
        setSelectedItem(item);
        console.log("selectedItem", selectedItem);
    };

    const handleCheckboxChange = (event, item) => {
        if (event.target.checked) {
            setSelectedItems([...selectedItems, item]);
        } else {
            setSelectedItems(selectedItems.filter((i) => i !== item));
        }
    };

    console.log("locations", locations);
    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p>
                        <h2>Связать локации и их компоненты</h2>
                    </p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <p>
                        Выбранная локация:{" "}
                        {selectedItem ? selectedItem.name : ""}
                    </p>
                    <p>Выбранные локации:</p>
                    <ul>
                        {selectedItems.map((item, index) => (
                            <li key={index}>{item.name}</li>
                        ))}
                    </ul>
                    <button>Добавить связь</button>
                </div>
            </div>
            <div className="row">
                <div className="col-md ">
                    <h2>Локации</h2>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTextOneLocation}
                        onChange={handleSearchTextOneLocationChange}
                    />
                    <div className="list-scroll-container">
                        <ul className="list">
                            {filteredListOneLocation.map((item, index) => (
                                <div onClick={() => handleListItemClick(item)}>
                                    {item.name}
                                </div>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="col-md ">
                    <h2>Локации</h2>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTextSecLocation}
                        onChange={handleSearchTextSecLocationChange}
                    />
                    <div className="list-scroll-container">
                        <ul className="list">
                            {filteredListSecLocation.map((item) => (
                                <div>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item)}
                                        onChange={(event) =>
                                            handleCheckboxChange(event, item)
                                        }
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
