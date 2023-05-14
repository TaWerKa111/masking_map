import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import RuleInfo from "../../components/rule/RuleInfo";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function AddRule() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rule, setRule] = useState({
        name: "",
        works: [],
        locations: [],
        conditions: [],
        type_locations: [],
        protections: [],
    });

    useEffect(() => {
        let rule_id = searchParams.get("id");
        if (rule_id) {
            let params = {
                rule_id: searchParams.get("rule_id"),
            };
            apiInst.get("/rule/rule/", { params: params }).then((res) => {
                setRule(res.data);
                console.log(res.data);
                console.log(searchParams.get("id"));
            });
        } else {
            setRule({
                name: "",
                works: [],
                locations: [],
                conditions: [],
                protections: [],
            });
        }
        console.log("add rule", rule);
    }, []);

    return <RuleInfo rule={rule}></RuleInfo>;
}
