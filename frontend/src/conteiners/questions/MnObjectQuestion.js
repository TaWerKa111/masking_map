import Select from "react-select";
import MnObjectList from "../../components/masking/MnObjectList";
import { apiInst } from "../../utils/axios";
import { useState, useEffect } from "react";

export default function MnObjectQuestions({
    handleClickAdd,
    selectedLocation,
}) {
    const [mnObjects, setMnObjects] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [treeList, setTreeList] = useState([]);
    const [optionsList, setOptionsList] = useState([]);

    const fetchLocations = (params = null, ind = 0) => {
        console.log("params", params);
        console.log("ind", ind);
        apiInst
            .get("/masking/location-list/", { params })
            .then((resp) => {
                let tempLoc = optionsList.filter(
                    (item, temp_ind) => temp_ind <= ind
                );
                let tempTree = treeList.filter(
                    (item, temp_ind) => temp_ind <= ind
                );
                console.log("tempTree", tempTree);
                console.log("tempLoc", tempLoc);
                setTreeList([
                    ...tempTree,
                    {
                        locations: resp.data.locations,
                        type_location: resp.data.type_location,
                    },
                ]);
                setOptionsList([
                    ...tempLoc,
                    [
                        ...resp.data.locations.map((item) => {
                            return {
                                value: item.id,
                                label: item.name,
                            };
                        }),
                    ],
                ]);

                console.log(resp.data.locations);
            })
            .catch((e) => console.log(e));
    };

    useEffect(() => {
        fetchLocations({
            parent_ids: ["null"],
        });
    }, []);

    const OnChangeName = (el) => {};

    const [selectedItems, setSelectedItems] = useState(selectedLocation);

    const handleSubmit = (event) => {
        event.preventDefault();
        handleClickAdd(selectedLocations[selectedLocations.length - 1]);
    };

    const handleCheckboxChange = (event, item) => {
        if (event.target.checked) {
            setSelectedItems([...selectedItems, item]);
        } else {
            setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
        }
    };

    const handleSelect = (el, ind) => {
        console.log("sel", el, ind);
        if (selectedLocations.length < ind + 1) {
            setSelectedLocations([...selectedLocations, el]);
        } else {
            // setSelectedLocations([
            //     ...selectedLocations
            //         .filter((item, temp_ind) => temp_ind <= ind)
            //         .map((item, item_ind) => {
            //             if (item_ind === ind) {
            //                 return el;
            //             }
            //             return item;
            //         }),
            // ]);
            selectedLocations[ind] = el;
            setSelectedLocations(selectedLocations);
        }
        fetchLocations(
            {
                "parent_ids[]": el.map((item) => item.value),
            },
            (ind = ind)
        );
    };

    console.log("selectedLocations", selectedLocations);
    console.log("treeList", treeList);
    console.log("optionsList", optionsList);

    if (treeList.length === 0) {
        return <h2>Нет мест проведения работ! Попробуйте позже.</h2>;
    }
    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <form onSubmit={handleSubmit}>
                        <ul className="">
                            {treeList.map((item, ind) => (
                                <div>
                                    <label>
                                        {item.locations && item.locations[0] && item.locations[0].type_location
                                            ? `Выберите из списка`
                                            : ""}
                                    </label>
                                    <Select
                                        options={optionsList[ind]}
                                        placeholder="Выберите..."
                                        value={selectedLocations[ind]}
                                        onChange={(el) => handleSelect(el, ind)}
                                        isSearchable
                                        isMulti
                                    ></Select>
                                </div>
                            ))}
                        </ul>
                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-blue"
                        >
                            Применить
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
