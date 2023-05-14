import MnObjectList from "../../components/masking/MnObjectList";
import { apiInst } from "../../utils/axios";
import { useState, useEffect } from "react";

export default function MnObjectQuestions({
    handleClickAdd,
    selectedLocation,
}) {
    const [mnObjects, setMnObjects] = useState([]);

    const [typeProtections, setTypeProtection] = useState([]);
    const [typeMnObject, setTypeMnObject] = useState([]);
    const [nameMnObject, setNameMnObject] = useState("");

    useEffect(() => {
        apiInst
            .get("/masking/location-list/")
            .then((resp) => {
                setMnObjects(
                    resp.data.locations === null ? [] : resp.data.locations
                );
                console.log(resp.data.locations);
            })
            .catch((e) => console.log(e));

        apiInst
            .get("")
            .then((resp) => setTypeProtection(resp.data))
            .catch((e) => console.log(e));

        apiInst
            .get("")
            .then((resp) => setTypeMnObject(resp.data))
            .catch((e) => console.log(e));
    }, []);

    const OnChangeName = (el) => {};

    return (
        <div className="container">
            <MnObjectList
                selectedLocation={selectedLocation}
                handleClickAdd={handleClickAdd}
                mnObjectList={mnObjects}
            />
        </div>
    );
}
