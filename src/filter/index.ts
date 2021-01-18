import { FilterCollection } from "../types";
import { PACKAGE_JSON, POLICY_DEFINITION_FILENAME, PROJECT_POLICY_CONFIG_FILENAME } from "../constant";

export const genFileFilter: FilterCollection = ["{.*,**}*.gen.cjs"];

export const policyFileFilter: FilterCollection = ["{*,.*,*/**}*", "!{*,*/**}*.gen.cjs"];

export const defaultFilterCollection: FilterCollection = [
    "!.git",
    "!node_modules",
    "!.idea",
    "!.gitignore",
    "!*-lock.json",
    "!*.lock",
    "!*.cache",
    `!${PACKAGE_JSON}`,
];

export const defaultPolicyFilter: FilterCollection = [...defaultFilterCollection, `!${POLICY_DEFINITION_FILENAME}`];

export const defaultProjectFilter: FilterCollection = ["{*,.*,*/**}*", ...defaultFilterCollection, `!${PROJECT_POLICY_CONFIG_FILENAME}`];
