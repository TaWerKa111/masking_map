import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiInst } from "../../utils/axios";
import RuleInfo from "../../components/rule/RuleInfo";
import LoadingSpinner from "../../components/main/LoadingSpinner";

const URL = "http:localhost:5001/api/masking/get-file/";

export default function AddRule() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rule, setRule] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [ruleId, setRuleId] = useState(null);

    useEffect(() => {
        let rule_id = searchParams.get("rule_id");
        console.log("rule_id", rule_id);
        if (rule_id) {
            let params = {
                rule_id: searchParams.get("rule_id"),
            };
            apiInst.get("/rule/rule/", { params: params }).then((res) => {
                setIsLoading(false);
                setRule({
                    name: res.data.name,
                    works: res.data.criteria.find(
                        (item) => item.type_criteria === "type_work"
                    ).works,
                    locations: res.data.criteria.find(
                        (item) => item.type_criteria === "location"
                    ).locations,
                    conditions: res.data.criteria.find(
                        (item) => item.type_criteria === "question"
                    ).questions,
                    protections: res.data.protections,
                    type_locations: res.data.criteria.find(
                        (item) => item.type_criteria === "type_location"
                    ).locations_type,
                    compensatory_measures: res.data.compensatory_measures,
                    criteria: res.data.criteria.map((item) => {
                        if (item.type_criteria === "question") {
                            return {
                                ...item,
                                questions: res.data.questions.map(
                                    (que_item) => ({
                                        ...que_item,
                                        value: item.id,
                                        label: item.text,
                                    })
                                ),
                                selected_type_criteria: {
                                    value: item.type_criteria,
                                    label: item.name,
                                },
                            };
                        }
                        return {
                            ...item,
                            selected_type_criteria: {
                                value: item.type_criteria,
                                label: item.name,
                            },
                        };
                    }),
                });
                console.log(res.data);
                console.log(searchParams.get("id"));
            });
            setRuleId(rule_id);
        } else {
            setRule({
                name: "",
                works: [],
                locations: [],
                conditions: [],
                protections: [],
                type_locations: [],
                compensatory_measures: "",
            });
            setIsLoading(false);
        }
        console.log("rule", rule);
    }, []);

    return isLoading ? (
        <LoadingSpinner></LoadingSpinner>
    ) : (
        <RuleInfo rule={rule} ruleId={ruleId}></RuleInfo>
    );
}
