import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TypeWorkList from "../masking/TypeWorkList";
import Modal from "react-modal";
import MnObjectQuestions from "../../conteiners/questions/MnObjectQuestion";

const ModalLocation = ({ isModal, onClose, handleClickAdd, locations }) => {
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <h2>Modal Title</h2>
            <MnObjectQuestions
                handleClickAdd={handleClickAdd}
                selectedLocation={locations}
            ></MnObjectQuestions>
            <button onClick={onClose}>Close Modal</button>
        </Modal>
    );
};

export default ModalLocation;
