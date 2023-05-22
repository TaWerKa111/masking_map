import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";

export default function MnObjectList({
    mnObjectList,
    handleClickAdd,
    selectedLocation,
}) {
    const [searchParams, serSearchParams] = useSearchParams();
    const [selectedItems, setSelectedItems] = useState(selectedLocation);
    const navigate = useNavigate();

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

    if (mnObjectList.length === 0) {
        return <h2>Нет мест проведения работ! Попробуйте позже.</h2>;
    }
    return (
        <div className="row">
            <div className="col-md">
                <form onSubmit={handleSubmit}>
                    <ul className="justify-content-center ">
                        {mnObjectList.map((item) => (
                            <div className="itemOfQuestions">
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedItems.filter(
                                            (i) => i.id == item.id
                                        ).length > 0
                                    }
                                    onChange={(event) =>
                                        handleCheckboxChange(event, item)
                                    }
                                    className="check-item"
                                />
                                {item.name}
                            </div>
                        ))}
                    </ul>
                    <button type="submit" className="btn btn-primary btn-full">
                        Применить
                    </button>
                </form>
            </div>
        </div>
    );
}
