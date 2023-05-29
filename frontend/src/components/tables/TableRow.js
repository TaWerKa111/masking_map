import React from "react";

const TableRow = ({ data, condition, handleClick }) => {
    const rowStyle = condition ? {} : { backgroundColor: "#EC3053" };

    return (
        <tr style={rowStyle}>
            <td>{data.id}</td>
            <td>{data.filename}</td>
            <td>{data.description}</td>
            {/* <td>{}</td> */}
            <td className="td-btn">
                <div className="d-flex justify-content-center">
                    <button
                        className="btn btn-primary btn-blue float-end "
                        onClick={(el) => handleClick(el, data.masking_uuid)}
                    >
                        Скачать
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default TableRow;
