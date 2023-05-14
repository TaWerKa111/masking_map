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
                        {/* <p>
                            Выбранная локация:{" "}
                            {selectedItem ? selectedItem.name : ""}
                        </p> */}
                        <p>Выбранные защиты:</p>
                        <ul>
                            {selectedProtections.map((item, index) => (
                                <li key={index}>{item.name}</li>
                            ))}
                        </ul>
                        <button onClick="submit">Выбрать защиты</button>
                    </form>
                </div>
            </div>
            <div className="row">
                {/* <div className="col-md ">
                    <h2>Локации</h2>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTextLocation}
                        onChange={handleSearchTextLocationChange}
                    />
                    <div className="list-scroll-container">
                        <ul className="list">
                            {filteredListLocation.map((item, index) => (
                                <div onClick={() => handleListItemClick(item)}>
                                    {item.name}
                                </div>
                            ))}
                        </ul>
                    </div>
                </div> */}
                <div className="col-md ">
                    <h2>Защиты</h2>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTextProtection}
                        onChange={handleSearchTextProtectionChange}
                    />
                    <div className="list-scroll-container">
                        <ul className="list">
                            {filteredListProtection.map((item) => (
                                <div>
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedProtections.filter(
                                                (i) => i.id == item.id
                                            ).length > 0
                                        }
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
