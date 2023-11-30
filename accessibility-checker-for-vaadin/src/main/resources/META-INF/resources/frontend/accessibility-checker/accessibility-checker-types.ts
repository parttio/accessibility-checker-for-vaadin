
import { RuleDetails } from "accessibility-checker/lib/api/IEngine";

export enum ACRuleCategory {
    VIOLATION = "VIOLATION",
    RECOMMENDATION = "RECOMMENDATION",
    NEED_REVIEW = "NEED_REVIEW"
}

export type ACRuleDetails = RuleDetails & {
    tagName: string;
    ruleCategory: ACRuleCategory;
    solved: boolean;
};

export interface ACIgnoredRule {
    /**
     * RuleId to ignore
     */
    ruleId?: string;
    /**
     * HTML tag ignored
     */
    htmlTag?: string;
    /**
     * if true the rule will be applied only if it's the last tag
     * if false the rule will be applied only if it's not the last tag (all the children)
     * if empty, the rule will be applied
     * Note the htmlTag is required to use true/false
     */
    lastTag?: boolean;
}