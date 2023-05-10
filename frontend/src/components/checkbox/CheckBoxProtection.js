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
        <div>
            <div className="type-work-name">{name}</div>
            <input
                type="checkbox"
                checked={isMasking}
                onChange={(e) => onMaskingChange(e.target.checked)}
            />
            <label htmlFor={`checkbox-${id}-1`}>Маскирование</label>
            <input
                type="checkbox"
                checked={isDemasking}
                onChange={(e) => onDemaskingChange(e.target.checked)}
            />
            <label htmlFor={`checkbox-${id}-2`}>Демаскирование</label>
        </div>
    );
};

export default CheckboxProtection;
