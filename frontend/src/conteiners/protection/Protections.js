import { createSearchParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";


const URL = "http:localhost:5001/api/masking/get-file/";

export default function Protections () {
    const [searchParams, setSearchParams] = useSearchParams();
    const [protections, setProtections] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        let params = {};
        apiInst
            .get("/protections/", {params})
            .then((resp) => {
                setProtections(resp.data);
            })
            .catch(e => console.log(e));
    }, [])

    const onClickDelete = (event, key) => {
        let params = {
            rule_id: key
        }; 
        console.log(params);
        apiInst.delete(
            "/protections/", params=params
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
                pathname: `/protections/`,
                search: `?${createSearchParams(params)}`
            }
        );
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md d-flex justify-content-center">
                    <h2>Защиты</h2>
                    <ul className="d-flex justify-content-center">
                        {
                            protections.map(
                                protection => <div key={protection.id} className="itemOfQuestions" onClick={el => onClick(el, protection.id)}>{protection.name}</div>
                            )
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
}
