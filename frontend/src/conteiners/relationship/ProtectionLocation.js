import { createSearchParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";


export default function ParentLocation () {
    const [locations, setLocations] = useState(null);
    const [protections, setProtections] = useState(null);
    const navigate = useNavigate();

    const deleteClick = (event, key) => {
        console.log("delete el", key);
    }
    const editClick = (value) => {
        console.log("edit el", value);
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p><h2>Связать локации и их компоненты</h2></p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                </div>
            </div>
        </div>
    )
}
