import TypeWorkList from "../../components/masking/TypeWorkList";
import { apiInst } from '../../utils/axios';
import { useState, useEffect } from "react";

const options = [
    {
        label: 'Ничего не выбрано',
        value: ''
    },
]

export default function TypeWorkQuestions() {
    const [typeWorks, setTypeWorks] = useState([
        {
            "id": 1,
            "name": "Work 1"
        }
    ]);

    const [typeProtections, setTypeProtections] = useState([]);
    const [typeProtetion, setTypeProtection] = useState([]);
    const [typeMnObject, setTypeMnObject] = useState([]);
    const [nameTypeWork, setNameTypeWork] = useState("");

    const getFromTypeProtections = () => {
        return typeProtetion ? typeProtections.find(c => c.value === typeProtetion) : [];
    }

    const setTypeProtectionsForm = (formOfControlList) => {
        let newOptions = []
        Object.assign(newOptions, options)
        formOfControlList.forEach(
            function (formOfControl) {
                newOptions.push(
                    {
                        label: formOfControl.name,
                        value: formOfControl.id,
                    }
                )

            }
        )
        setTypeProtections(newOptions);

    }

    useEffect(() => {
        apiInst
            .get("/masking/type-work/")
            .then((resp) => {
                setTypeWorks(resp.data === null ? []: resp.data);
                console.log(resp.data);
            })
            .catch(e => console.log(e)); 

        apiInst
            .get("/masking/type-protection/")
            .then((resp) => {
                setTypeProtectionsForm(resp.data);
                console.log(typeProtections)
            }
            )
            .catch(e => console.log(e));
        
        apiInst
            .get("/masking/type-object/")
            .then((resp) =>
                setTypeMnObject(resp.data)
            )
            .catch(e => console.log(e));
    }, []);

    const OnChangeName = (el) => {
        setNameTypeWork(el.target.value);
    };
    console.log(options)
    return (
        <div>
            <div className="container">
                <div className="row">   
                    <div className="col-md">
                        <div className="form-control element-form">
                            <div className="form-group">
                                <select placeholder="Тип защиты" multiple={true} value={getFromTypeProtections()} options={options}/>
                            </div>
                        </div>
                    </div>

                    <div className="col-md">
                        <div className="form-control element-form">
                            <div className="form-group">
                                <select placeholder="Тип объекта" value={typeMnObject}></select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row ">
                    <div className="col-md">
                        <div className="form-control element-form">
                            <div className="form-group">
                                <div className='input-group mb-3'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>Введите название объекта</span>
                                    </div>
                                <input type={"text"}
                                    name={"name"}
                                    value={nameTypeWork}
                                    className=''
                                    aria-describedby="basic-addon1"
                                    onChange={null}
                                />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <TypeWorkList typeWorkList={typeWorks}/>
            </div>
        </div>
    )
}