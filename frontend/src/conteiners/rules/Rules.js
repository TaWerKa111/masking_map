import { createSearchParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import AddElementButton from "../forms/AddElementForm";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function Rules () {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rules, setRules] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        // apiInst
        //     .get("/rules/", {params})
        //     .then((resp) => {
        //         setRules(resp.data);
        //     })
        //     .catch(e => console.log(e));
        setRules(
            {"rules": [{"name": "rule 1", "id": 1}]}
        )
    }, [])

    const onClickDelete = (event, key) => {
        let params = {
            rule_id: key
        }; 
        console.log(params);
        apiInst.delete(
            "/rule/", params=params
        ).then(resp => 
            alert(resp.result ? "Удалено" : "Не удалено")
        ).catch(
            e => console.log(e)
        )
    }

    const onClick = (event, key) => {
        let params = {
            rule_id: key
        }; 
        console.log(params);
        navigate(
            {
                pathname: `/expert/rule/`,
                search: `?${createSearchParams(params)}`
            }
        );
    };

    const deleteClick = (event, key) => {
        console.log("delete el", key);
    }
    const editClick = (event, key) => {
        console.log("edit el", key);
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex">
                    <AddElementButton>Добавить локацию</AddElementButton>
                </div>
            </div>
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <p><h2>Правила</h2></p>
                </div>
            </div>
            <div className="row">
                <div className="col-md">
                    <ul className="d-flex justify-content-center">
                        {
                            rules == null ?
                                <p><h2>Нет правил!</h2></p>
                            :
                                rules.rules.map(
                                    rule => <div key={rule.id} className="itemOfQuestions" >
                                            <p onClick={el => onClick(el, rule.id)}>{rule.name}</p>
                                            <button className="btn" onClick={el => editClick(el, rule.id)}>Изменить</button>
                                            <button className="btn" onClick={el => deleteClick(el, rule.id)}>Удалить</button>
                                        </div>
                                )
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
}
