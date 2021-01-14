import globby from "globby";
import { posix } from "path";
import { POLICY_DEFINITION_FILENAME, PROJECT_POLICY_CONFIG_FILENAME } from "../constant";

type scanDirFunction = (path: string) => boolean;

export const isProject: scanDirFunction = (path) => {
    return !!globby.sync(PROJECT_POLICY_CONFIG_FILENAME, {
        onlyFiles: true,
        cwd: posix.normalize(path),
    }).length;
};

export const isPolicy: scanDirFunction = (path) => {
    return !!globby.sync(POLICY_DEFINITION_FILENAME, {
        onlyFiles: true,
        cwd: posix.normalize(path),
    }).length;
};
