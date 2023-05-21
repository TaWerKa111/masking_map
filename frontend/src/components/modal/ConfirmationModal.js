import React from "react";

const ConfirmationModal = ({ isOpen, onCancel, onConfirm }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div>
            <div>Вы уверены, что хотите удалить?</div>
            <button onClick={onCancel}>Отмена</button>
            <button onClick={onConfirm}>Подтвердить</button>
        </div>
    );
};

export default ConfirmationModal;
