import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TypeWorkList from "../masking/TypeWorkList";
import Modal from "react-modal";
import MnObjectQuestions from "../../conteiners/questions/MnObjectQuestion";

const ModalLocation = ({ isModal, onClose, handleClickAdd, locations }) => {
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
                    Выберите необходимые места проведения работ и нажмите на
                    кнопку "Выбрать работы"
                </p>
            </div>
            <MnObjectQuestions
                handleClickAdd={handleClickAdd}
                selectedLocation={locations}
            ></MnObjectQuestions>
        </Modal>
    );
};

export default ModalLocation;
