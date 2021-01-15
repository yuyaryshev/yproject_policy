import { ExcludeFromProject } from "src/types";
import {strict} from "assert";

export const POLICY_DEFINITION_FILENAME: string = "project_policy_definition.cjs";

export const PROJECT_POLICY_CONFIG_FILENAME: string = "yproject_policy.cjs";

export const PACKAGE_JSON: string = "package.json";

export const POLICY_EXPECTS_FILE_PREFIX: string = "YPOLICY_EXPECTS_";

export const EXCLUDE_FROM_PROJECT_REGEX: ExcludeFromProject = {
    directories: [".git", ".idea", "node_modules", "docs"],
    files: [".eslintcache", "package.json", "^YPOLICY_EXPECTS_.+", "^[\\w,\\s-]+-lock.json$"],
};

export const LOCAL_PACKAGES_FOLDER: string = "local_packages_folder";

export const TEXT_EDITOR: string = "text_editor";

export const POLICY_NOT_FOUND = {
    question: "Try to find policies at local_packages_folder?",
    answers: ['Try', 'Skip'],
}

export const FILES_NOT_MATCH = {
    question: "Files do not match. What are we gonna do?",
    answers: ["Replace", "Skip", "Compare"],
}

export const ADDITIONAL_FILES = {
    question: "Files do not match. What are we gonna do?",
    answers: ["Replace", "Skip"],
}