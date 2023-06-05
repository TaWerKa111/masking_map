import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import CondigionsList from "../../conteiners/questions/CondigionsList";
import NextConditions from "../../conteiners/questions/NextVersionQuestion";

const ModalQuestions = ({ isModal, onClose, conditions, handleClickAdd }) => {
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <div className="text-center header-modal">
                <label className="h2 text-center">Уточняющие вопросы</label>
                <button
                    className="float-end btn btn-close"
                    onClick={onClose}
                ></button>
                <p>
                    После выбора вопросов из списка нужно отметить ответы,
                    которые приведут к выполнению правила. Для того чтобы задать
                    нумерацию вопроса, можно просто перетащить вопрос на
                    необходимую позицию.{" "}
                    <strong>Номер вопроса отмечается перед ним.</strong>
                </p>
            </div>
            <div></div>
            {/* <CondigionsList
                selectedConditions={conditions}
                handleClickAdd={handleClickAdd}
            ></CondigionsList> */}
            <NextConditions
                selectedConditions={conditions}
                handleClickAdd={handleClickAdd}
            ></NextConditions>
        </Modal>
    );
};

export default ModalQuestions;
