import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import CondigionsList from "../../conteiners/questions/CondigionsList";

const ModalQuestions = ({ isModal, onClose, conditions, handleClickAdd }) => {
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <div className="text-center header-modal">
                <label className="h2 text-center">Уточняющие вопросы</label>
                <button
                    className="float-end btn btn-close"
                    onClick={onClose}
                ></button>
            </div>
            <div></div>
            <CondigionsList
                selectedConditions={conditions}
                handleClickAdd={handleClickAdd}
            ></CondigionsList>
        </Modal>
    );
};

export default ModalQuestions;
