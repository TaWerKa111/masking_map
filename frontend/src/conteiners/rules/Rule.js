import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import RuleInfo from "../../components/rule/RuleInfo";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function Rule() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rule, setRule] = useState(null);

    useEffect(() => {
        let params = {
            rule_id: searchParams.get("rule_id"),
        };
        console.log("params", params);
        apiInst
            .get("/rule/", { params })
            .then((resp) => {
                setRule(resp.data);
            })
            .catch((e) => console.log(e));
    }, []);

    if (!rule) {
        return <h2 className="text-center">Нет такого правила!</h2>;
    } else {
        return <RuleInfo rule={rule}></RuleInfo>;
    }
}
