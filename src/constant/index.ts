import { ExcludeFromPolicy } from "src/types";

export const POLICY_DEFINITION_FILENAME: string = "project_policy_definition.cjs";
export const PROJECT_POLICY_CONFIG_FILENAME: string = "yproject_policy.cjs";
export const EXCLUDE_FROM_POLICY_REGEX: ExcludeFromPolicy = {
    directories: [
        ".git",
        ".idea",
        "node_modules",
        "docs",
    ],
    files: [
        "package.json",
        ".gitignore",
        "^[\\w,\\s-]+-lock.json$",
    ],
};
