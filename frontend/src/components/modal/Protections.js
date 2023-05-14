import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TypeWorkList from "../masking/TypeWorkList";
import Modal from "react-modal";
import ChoiceProtections from "../../conteiners/protection/ChoiceProtection";

const ModalChoiceProtections = ({
    isModal,
    onClose,
    protections,
    handleClickAdd,
}) => {
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <div className="text-center header-modal">
                <label className="h2 text-center">Выбор защит</label>
                <button
                    className="float-end btn btn-close"
                    onClick={onClose}
                ></button>
            </div>
            <div></div>
            <ChoiceProtections
                selProtections={protections}
                handleClickAdd={handleClickAdd}
            ></ChoiceProtections>
        </Modal>
    );
};

export default ModalChoiceProtections;
