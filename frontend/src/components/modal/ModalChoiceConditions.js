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
            <div className="text-center header-modal">
                <label className="h2 text-center">Уточняющие вопросы</label>
                <button className="float-end btn btn-close" onClick={onClose}></button>
            </div>
            <div>
                <p className="text-center">Ответь на ряд вопросов и нажмите на кнопку Принять ответы</p>
            </div>
            <AnswerConditionList
                selectedConditions={conditions}
                handleClickAdd={handleClickAdd}
            ></AnswerConditionList>
        </Modal>
    );
};

export default ModalChoiceConditions;
