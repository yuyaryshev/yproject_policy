import { ExcludeFromProject } from "src/types";

export const POLICY_DEFINITION_FILENAME: string = "project_policy_definition.cjs";

export const PROJECT_POLICY_CONFIG_FILENAME: string = "yproject_policy.cjs";

export const PACKAGE_JSON: string = "package.json";

export const POLICY_EXPECTS_FILE_PREFIX = "YPOLICY_EXPECTS_";

export const EXCLUDE_FROM_PROJECT_REGEX: ExcludeFromProject = {
    directories: [".git", ".idea", "node_modules", "docs"],
    files: [".eslintcache", "package.json", "^YPOLICY_EXPECTS_.+", "^[\\w,\\s-]+-lock.json$"],
};
