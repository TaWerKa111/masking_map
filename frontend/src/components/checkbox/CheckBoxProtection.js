import React, { useState } from "react";

const CheckboxProtection = ({
    id,
    name,
    isMasking,
    isDemasking,
    onMaskingChange,
    onDemaskingChange,
}) => {
    return (
        <tr>
            <td className="type-work-name">{name}</td>
            <td>
                <input
                    type="checkbox"
                    checked={isMasking}
                    onChange={(e) => onMaskingChange(e.target.checked)}
                />
                <label htmlFor={`checkbox-${id}-1`}>Маскирование</label>
            </td>
            <td>
                <input
                    type="checkbox"
                    checked={isDemasking}
                    onChange={(e) => onDemaskingChange(e.target.checked)}
                />
                <label htmlFor={`checkbox-${id}-2`}>Демаскирование</label>
            </td>
        </tr>
    );
};

export default CheckboxProtection;
