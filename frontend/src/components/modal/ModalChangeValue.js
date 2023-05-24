import { useState } from "react";
import Select from "react-select";
import ModalLocation from "./ModalLocation";
import ModalQuestions from "./ModalQuestions";
import ModalTypeWork from "./ModalTypeWork";

const ModalChangeValue = (props) => {
    if (!props.criteria.selected_type_criteria) {
        return <></>;
    }

    switch (props.criteria.selected_type_criteria.value) {
        case "type_work": {
            return (
                <ModalTypeWork
                    isModal={props.isModal}
                    onClose={props.handleModalTypeWork}
                    handleClickAdd={props.handleTypeWorks}
                    works={props.criteria.type_works}
                ></ModalTypeWork>
            );
        }
        case "location": {
            return (
                <ModalLocation
                    isModal={props.isModalLocation}
                    onClose={props.handleModalLocation}
                    handleClickAdd={props.handleLocations}
                    locations={props.criteria.locations}
                ></ModalLocation>
            );
        }
        case "question": {
            return (
                <ModalQuestions
                    isModal={props.isModalCondition}
                    onClose={props.handleModalQuestion}
                    handleClickAdd={props.handleConditions}
                    conditions={props.criteria.conditions}
                ></ModalQuestions>
            );
        }
        default:
            return <></>;
    }
};

export default ModalChangeValue;
