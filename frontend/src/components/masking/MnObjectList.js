import { createSearchParams, useNavigate, useSearchParams } from "react-router-dom";

export default function MnObjectList ({mnObjectList}) {
    const [searchParams, serSearchParams] = useSearchParams();
    
    const onClick = (el, key) => {
        let params = {
            type_work_id: searchParams.get("type_work_id"),
            mn_object_id: key,
        }
        navigate({
            pathname: `/masking-map/`,
            search: `?${createSearchParams(params)}`,
        });
    };

    const navigate = useNavigate();

    if (mnObjectList.length === 0){
        return (<h2>Нет вопросов! Попробуйте позже.</h2>)
    }
    return (
        <div className="row">
            <div className="col-md">
                <h2 className="text-center">Необходимо выбрать только один ответ</h2>
                <ul className="d-flex justify-content-center">
                    {
                        mnObjectList.map(
                            mnobject => <div className="itemOfQuestions" onClick={el => onClick(el, mnobject.id)}>{mnobject.name}</div>
                        )
                    }
                </ul>
            </div>

        </div>
    );
}
