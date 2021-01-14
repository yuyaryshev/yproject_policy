import { GlobbyPatternCollection } from "../types";
import { PACKAGE_JSON, POLICY_DEFINITION_FILENAME, PROJECT_POLICY_CONFIG_FILENAME } from "../constant";

export const globbyGenFilePattern: GlobbyPatternCollection = ["{*,*/**}*.gen.cjs"];

export const globbyPolicyFilePattern: GlobbyPatternCollection = ["{*,.*,*/**}*", "!{*,*/**}*.gen.cjs"];

export const globbyPolicyDefaultPattern: GlobbyPatternCollection = [
    "!.git",
    "!node_modules",
    "!.idea",
    "!.gitignore",
    "!*-lock.json",
    "!*.lock",
    `!{*,*/**}${POLICY_DEFINITION_FILENAME}`,
    `!{*,*/**}${PROJECT_POLICY_CONFIG_FILENAME}`,
    `!${PACKAGE_JSON}`,
];
