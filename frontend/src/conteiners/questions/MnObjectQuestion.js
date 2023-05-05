import MnObjectList from '../../components/masking/MnObjectList';
import { apiInst } from '../../utils/axios';
import { useState, useEffect } from "react";

export default function MnObjectQuestions() {
    const [mnObjects, setMnObjects] = useState([
        {
            id: 1,
            name: "Mn object 1"
        }
    ]);
    const [typeProtections, setTypeProtection] = useState([]);
    const [typeMnObject, setTypeMnObject] = useState([]);
    const [nameMnObject, setNameMnObject] = useState("");

    useEffect(() => {
        apiInst
            .get("/masking/mn-object/")
            .then((resp) => {
                setMnObjects(resp.data === null ? []: resp.data);
                console.log(resp.data);
            })
            .catch(e => console.log(e));

        apiInst
            .get("")
            .then((resp) => 
                setTypeProtection(resp.data)
            )
            .catch(e => console.log(e));
        
        apiInst
            .get("")
            .then((resp) =>
                setTypeMnObject(resp.data)
            )
            .catch(e => console.log(e));
    }, []);


    const OnChangeName = (el) => {
        
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md">
                    <div className="form-control element-form">
                        <div className="form-group">
                            <select placeholder="Тип защиты" value={typeProtections}></select>
                        </div>
                    </div>
                </div>

                <div className="col-md">
                    <div className="form-control element-form">
                        <div className="form-group">
                            <select placeholder="Тип объекта" value={typeProtections}></select>
                        </div>
                    </div>
                </div>
            </div>
            <row>
                <div className="col-md">
                    <div className="form-control element-form">
                        <div className="form-group">
                            <div className='input-group mb-3'>
                                <div className='input-group-prepend'>
                                    <span className='input-group-text'>Введите название объекта</span>
                                </div>
                            <input type={"text"}
                                name={"name"}
                                value={nameMnObject}
                                className=''
                                aria-describedby="basic-addon1"
                                onChange={null}
                            />
                            </div>
                        </div>
                    </div>
                </div>
            </row>


            <MnObjectList mnObjectList={mnObjects}/>
        </div>
    )
}