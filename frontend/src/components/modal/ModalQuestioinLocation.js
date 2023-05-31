import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TypeWorkList from "../masking/TypeWorkList";
import Modal from "react-modal";
import MnObjectQuestions from "../../conteiners/questions/MnObjectQuestion";

const ModalQuestioinLocation = ({ isModal, onClose, handleClickAdd, locations, type_locations }) => {
    const [selectedLocations, setSelectedLocaations] = useState([]);
    const [selectedTypeLocations, setSelectedTypeLocations] = useState([]);

    const handleSubmit = () => {
        handleClickAdd(selectedLocations, selectedTypeLocations);
        onClose();
    }
    
    const handleChangeCheked = (event, location) => {
        if (event.target.checked) {
            setSelectedLocaations([...selectedLocations, location]);
        } else {
            setSelectedLocaations(selectedLocations.filter((i) => i.id !== location.id));
        }
    }

    const handleChangeChekedTypeLocations = (event, type_location) => {
        if (event.target.checked) {
            setSelectedTypeLocations([...selectedTypeLocations, type_location]);
        } else {
            setSelectedTypeLocations(selectedTypeLocations.filter((i) => i.id !== type_location.id));
        }
    }

    console.log("locations", locations);
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <div className="text-center header-modal">
                <label className="h2 text-center">
                    Выберите место проведения работ
                </label>
                <button
                    className="float-end btn btn-close"
                    onClick={onClose}
                ></button>
            </div>
            <div>
                <p className="text-center">
                    Ответьте на ряд вопросов о местах провведения работ.
                </p>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-md">
                        <form onSubmit={handleSubmit}>
                                {locations.length > 0 ?
                                locations.map((location) => (
                                    <div>
                                        <div key={location.id}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="is_right"
                                                    checked={
                                                        selectedLocations.filter(
                                                            (i) => i.id == location.id
                                                        ).length > 0
                                                    }
                                                    onChange={(e) =>
                                                        handleChangeCheked(
                                                            e,
                                                            location
                                                        )
                                                    }
                                                />
                                                {location.name}
                                            </label>
                                        </div>
                                    </div>
                                ))
                                : 
                                <></>
                            }
                            {
                                type_locations.length > 0 ?
                                type_locations.map(type_location => (
                                    <div>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_right"
                                            checked={
                                                selectedTypeLocations.filter(
                                                    (i) => i.id == type_location.id
                                                ).length > 0
                                            }
                                            onChange={(e) =>
                                                handleChangeChekedTypeLocations(
                                                    e,
                                                    type_location
                                                )
                                            }
                                        />
                                        {type_location.name}
                                    </label>
                                </div>
                                ))
                                :<></>
                            }
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
        </Modal>
    );
};

export default ModalQuestioinLocation;
