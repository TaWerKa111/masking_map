import Modal from "react-modal";
import QuestionInfo from "../question/QuestionInfo";

const ModalQuestion = ({
    isModal,
    onClose,
    handleClickAdd,
    question,
    question_id = null,
}) => {
    return (
        <Modal isOpen={isModal} onRequestClose={onClose}>
            <div className="text-center header-modal">
                <label className="h2 text-center">Редактирование вопроса</label>
                <button
                    className="float-end btn btn-close"
                    onClick={onClose}
                ></button>
            </div>
            <div>
                <p className="text-center">Измените вопрос"</p>
            </div>
            <QuestionInfo
                handleClickAdd={handleClickAdd}
                question_id={question_id}
                question_info={question}
            ></QuestionInfo>
        </Modal>
    );
};

export default ModalQuestion;
