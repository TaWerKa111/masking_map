import React from "react";
import { Modal, Button } from "react-bootstrap";

const InstructionModal = ({ show, onClose }) => {
    return (
        <Modal
            show={show}
            onHide={onClose}
            size="lg"
            centered
            className="instruction-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Инструкция</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Содержимое инструкции */}
                <p>Текст инструкции...</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InstructionModal;
