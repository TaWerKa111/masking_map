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
            <h2>Modal Title</h2>
            <ChoiceProtections
                selProtections={protections}
                handleClickAdd={handleClickAdd}
            ></ChoiceProtections>
            <button onClick={onClose}>Close Modal</button>
        </Modal>
    );
};

export default ModalChoiceProtections;
