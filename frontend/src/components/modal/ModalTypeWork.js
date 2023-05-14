import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TypeWorkList from "../masking/TypeWorkList";
import Modal from "react-modal";
import TypeWorkQuestions from "../../conteiners/questions/TypeWorkQuestions";

const ModalTypeWork = ({ isModal, onClose, handleClickAdd, works }) => {
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <div className="text-center header-modal">
                <label className="h2 text-center">Выбрать вид работы</label>
                <button
                    className="float-end btn btn-close"
                    onClick={onClose}
                ></button>
            </div>
            <div>
                <p className="text-center">
                    Выберите необходимы виды работ и нажмите на кнопку "Выбрать
                    работы"
                </p>
            </div>
            <TypeWorkQuestions
                handleClickAdd={handleClickAdd}
                selectedWorks={works}
            ></TypeWorkQuestions>
        </Modal>
    );
};

export default ModalTypeWork;
