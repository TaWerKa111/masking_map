import {
    createSearchParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";

export default function TypeWorkList({
    typeWorkList,
    handleClickAdd,
    selectedWorks,
}) {
    const [selectedItems, setSelectedItems] = useState(selectedWorks);

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

    if (typeWorkList.length === 0) {
        return <h2>Нет видов работ! Попробуйте позже.</h2>;
    }
    return (
        <div className="row">
            <div className="col-md">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-center">Необходимо выбрать локацию</h2>
                    <button type="submit">Выбрать вид работ</button>
                </form>
                <ul className="d-flex justify-content-center ">
                    {typeWorkList.map((item) => (
                        <div className="itemOfQuestions">
                            <input
                                type="checkbox"
                                checked={
                                    selectedItems.filter((i) => i.id == item.id)
                                        .length > 0
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
    );
}