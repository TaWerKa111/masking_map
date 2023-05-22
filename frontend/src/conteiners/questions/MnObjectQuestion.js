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

    const fetchLocations = (params=null, ind=0) => {
        console.log("params", params);
        console.log("ind", ind);
        apiInst
            .get("/masking/location-list/", {params})
            .then((resp) => {
                let tempLoc = optionsList.filter((item, temp_ind) => (temp_ind <= ind));
                let tempTree = treeList.filter((item, temp_ind) => (temp_ind <= ind));
                console.log("tempTree", tempTree);
                console.log("tempLoc", tempLoc);
                setTreeList([...tempTree, {
                    locations: resp.data.locations,
                    type_location: resp.data.type_location,
                }]);
                setOptionsList([...tempLoc, [...resp.data.locations.map((item) => {
                    return {
                        value: item.id,
                        label: item.name,
                    }
                })]]);
                
                console.log(resp.data.locations);
            })
            .catch((e) => console.log(e));
    };

    useEffect(() => {
        fetchLocations(
            {
                parent_id: "null"
            }
        );
    }, []);

    const OnChangeName = (el) => {};

    const [selectedItems, setSelectedItems] = useState(selectedLocation);

    const handleSubmit = (event) => {
        event.preventDefault();
        handleClickAdd(selectedItems);
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
            setSelectedLocations([
                ...selectedLocations, el
            ]);
        }
        else {
            setSelectedLocations([
                ...selectedLocations.filter((item, temp_ind) => (temp_ind <= ind))
                .map((item, item_ind) =>{
                    if (item_ind === ind) {
                        return el;
                    }
                    return item;
                })      
                ]
            );
        }
        fetchLocations({
            parent_id: el.value,
        }, ind=ind);
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
                            // <div className="itemOfQuestions">
                            //     <input
                            //         type="checkbox"
                            //         checked={
                            //             selectedItems.filter(
                            //                 (i) => i.id == item.id
                            //             ).length > 0
                            //         }
                            //         onChange={(event) =>
                            //             handleCheckboxChange(event, item)
                            //         }
                            //         className="check-item"
                            //     />
                            //     {item.name}
                            // </div>
                            <div>
                                <label>{item.type_location ? item.type_location.name: ""}</label>
                                <Select
                                    options={optionsList[ind]}
                                    placeholder="Выберите..."
                                    value={selectedLocations[ind]}
                                    onChange={(el) => handleSelect(el, ind)}
                                    isSearchable
                                >
                                </Select>
                            </div>
                        ))}
                    </ul>
                    <button type="submit" className="btn btn-primary btn-full">
                        Применить
                    </button>
                </form>
            </div>
        </div>
        </div>
    );
}
