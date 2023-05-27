import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TypeWorkList from "../masking/TypeWorkList";
import Modal from "react-modal";
import MnObjectQuestions from "../../conteiners/questions/MnObjectQuestion";

const ModalDescriptions = ({ isModal, onClose, descriptions }) => {
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <div className="container-fluid">
                <div className="row">
                    <div className="col">
                        <div className="text-center header-modal">
                            <label className="h2 text-center">
                                Путь выбора защит по правилам
                            </label>
                            <button
                                className="float-end btn btn-close"
                                onClick={onClose}
                            ></button>
                        </div>
                    </div>
                </div>
                {descriptions.length > 0 ? (
                    <div>
                        {descriptions.map((item, index) => (
                            <div>
                                <div className="desctiption text-center">
                                    {item}
                                </div>
                                {index < descriptions.length - 1 ? (
                                    <div class="arrow-8"></div>
                                ) : (
                                    <> </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </Modal>
    );
};

export default ModalDescriptions;
