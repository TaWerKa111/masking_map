import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import AnswerConditionList from "../../conteiners/questions/AnswerConditionList";

const ModalChoiceConditions = ({
    isModal,
    onClose,
    conditions,
    handleClickAdd,
}) => {
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <h2>Уточняющие вопросы</h2>
            <AnswerConditionList
                selectedConditions={conditions}
                handleClickAdd={handleClickAdd}
            ></AnswerConditionList>
            <button onClick={onClose}>Close Modal</button>
        </Modal>
    );
};

export default ModalChoiceConditions;
