import TypeWorkList from "../../components/masking/TypeWorkList";
import { apiInst } from "../../utils/axios";
import { useState, useEffect } from "react";

export default function TypeWorkQuestions({ handleClickAdd, selectedWorks }) {
    const [typeWorks, setTypeWorks] = useState([
        { name: "Огневые работы", id: 1 },
        { name: "Диагностические работы", id: 2 },
    ]);

    useEffect(() => {
        apiInst
            .get("/masking/type-work/")
            .then((resp) => {
                setTypeWorks(resp.data === null ? [] : resp.data.type_works);
                console.log(resp.data.type_works);
            })
            .catch((e) => console.log(e));
    }, []);

    return (
        <div>
            <div className="container">
                <TypeWorkList
                    selectedWorks={selectedWorks}
                    typeWorkList={typeWorks}
                    handleClickAdd={handleClickAdd}
                />
            </div>
        </div>
    );
}
