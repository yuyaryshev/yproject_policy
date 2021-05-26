import { Filter, FilterCollection } from "../types";
import {
    PACKAGE_JSON, POLICY_DEFINITION_FILENAME, PROJECT_POLICY_CONFIG_FILENAME, PROJECT_POLICY_PREV_CONTENT_FILENAME
} from "./consts";

export const genFileFilter: Filter = "{.*,**}*.gen.cjs";

export const defaultFilterCollection: FilterCollection = [
    ".git",
    "node_modules",
    ".idea",
    "*-lock.json",
    "*.lock",
    "*.cache",
    "*-lock.yaml",
    PACKAGE_JSON,
    PROJECT_POLICY_CONFIG_FILENAME,
    POLICY_DEFINITION_FILENAME,
    PROJECT_POLICY_PREV_CONTENT_FILENAME,
];
