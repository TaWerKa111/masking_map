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
        setRule({
            name: "",
            works: [],
            locations: [],
            conditions: [],
            protections: [],
        });
        console.log("add rule", rule);
    }, []);

    return <RuleInfo rule={rule}></RuleInfo>;
}
