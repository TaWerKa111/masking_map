import { createSearchParams, useNavigate } from "react-router-dom";

export default function TypeWorkList ({typeWorkList}) {
    
    const onClick = (event, key) => {
        let params = {
            type_work_id: key
        }; 
        console.log(params);
        navigate(
            {
                pathname: `/mn-object/`,
                search: `?${createSearchParams(params)}`
            }
        );
    };

    const navigate = useNavigate();

    if (typeWorkList.length === 0){
        return (<h2>Нет вопросов! Попробуйте позже.</h2>)
    }
    return (
        <div className="row">
            <div className="col-md">
                <h2 className="text-center">Необходимо выбрать только один ответ</h2>
                <ul className="d-flex justify-content-center ">
                    {
                        typeWorkList.map(
                            work => <div key={work.id} className="itemOfQuestions" onClick={el => onClick(el, work.id)}>{work.name}</div>
                        )
                    }
                </ul>
            </div>
        </div>
    );
}
