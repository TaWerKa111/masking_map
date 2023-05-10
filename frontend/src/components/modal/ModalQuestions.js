import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import CondigionsList from "../../conteiners/questions/CondigionsList";

const ModalConditions = ({ isModal, onClose, conditions, handleClickAdd }) => {
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <h2>Уточняющие вопросы</h2>
            <CondigionsList
                selectedConditions={conditions}
                handleClickAdd={handleClickAdd}
            ></CondigionsList>
            <button onClick={onClose}>Close Modal</button>
        </Modal>
    );
};

export default ModalConditions;
