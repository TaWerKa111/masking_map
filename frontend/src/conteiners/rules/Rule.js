import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";


const URL = "http:localhost:5001/api/masking/get-file/";

export default function Rule () {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rule, setRule] = useState(null);

    useEffect(() => {
        
        let params = {
            "rule_id": searchParams.get("rule_id"),
        };
        console.log("params", params);
        setRule(
            {
                "name": "rule 1",
                "works": [{"name": "work1", "id": 1}],
                "locations": [],
                "conditions": []
            }
        )
        // apiInst
        //     .get("/rule/", {params})
        //     .then((resp) => {
        //         setRule(resp.data);
        //     })
        //     .catch(e => console.log(e));
    }, [])

    if (!rule) {
        return (<h2 className="text-center">Нет такого правила!</h2>)
    }
    else {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md">
                        <label>Название: </label><input name="name_rule" disabled={false} value={rule.name}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md">
                        <label>
                            Виды работ:
                        </label>
                    </div>
                    <div className="col-md">
                        <p>
                            Виды работ:
                        </p>
                            <ul>
                                {
                                    rule.works.map(
                                        work => <p key={work.id}>{work.name}</p>
                                    )
                                }
                            </ul>
                        <button>Изменить</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md">
                        <label>
                            Локации:
                        </label>
                    </div>
                    <div className="col-md">
                        <p>
                            Локации:
                        </p>
                            <ul>
                                {
                                    rule.locations.map(
                                        location => <p key={location.id}>{location.name}</p>
                                    )
                                }
                            </ul>
                        <button>Изменить</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md">
                        <label>
                            Тип Локации:
                        </label>
                    </div>
                    <div className="col-md">
                        <p>
                            Тип Локации:
                        </p>
                            <ul>
                                {
                                    rule.works.map(
                                        work => <p key={work.id}>{work.name}</p>
                                    )
                                }
                            </ul>
                        <button>Изменить</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md">
                        <label>
                            Условия:
                        </label>
                    </div>
                    <div className="col-md">
                        <p>
                            Условия:
                        </p>
                            <ul>
                                {
                                    rule.conditions.map(
                                        condition => <p key={condition.id}>{condition.name}</p>
                                    )
                                }
                            </ul>
                        <button>Изменить</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md">
                        <h2 className="text-center">Защиты</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md">
                        <button>
                            Сохранить правило
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    
}
