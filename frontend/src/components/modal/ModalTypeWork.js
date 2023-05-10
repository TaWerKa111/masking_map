import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TypeWorkList from "../masking/TypeWorkList";
import Modal from "react-modal";
import TypeWorkQuestions from "../../conteiners/questions/TypeWorkQuestions";

const ModalTypeWork = ({ isModal, onClose, handleClickAdd, works }) => {
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <h2>Modal Title</h2>
            <TypeWorkQuestions
                handleClickAdd={handleClickAdd}
                selectedWorks={works}
            ></TypeWorkQuestions>
            <button onClick={onClose}>Close Modal</button>
        </Modal>
    );
};

export default ModalTypeWork;
