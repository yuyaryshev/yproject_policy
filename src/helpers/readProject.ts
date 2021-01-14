import {relative, join, posix} from "path";
import fs from "fs";
import {
    FileMap,
    GenFilesMap,
    GlobbyPatternCollection,
    PolicyData,
    PolicyDefinition,
    ProjectData, ProjectPolicyConfig,
    ReadDirCallback
} from "src/types";
import {globbyGenFilePattern, globbyPolicyDefaultPattern, globbyPolicyFilePattern, readDirRecursive} from "../helpers";
import {
    PROJECT_POLICY_CONFIG_FILENAME,
    EXCLUDE_FROM_PROJECT_REGEX,
    PACKAGE_JSON,
    POLICY_DEFINITION_FILENAME
} from "../constant";
import globby from "globby";

const { directories: excludeDirs, files: excludeFiles } = EXCLUDE_FROM_PROJECT_REGEX;

type readProjectType = (projectDir: string) => ProjectData;

export const readProject: readProjectType = (projectDir) => {
    try {
        const policyConf: PolicyDefinition = require(join(projectDir, PROJECT_POLICY_CONFIG_FILENAME));
        const files: FileMap = getProjectFiles(projectDir, policyConf);
        const packageJson: object = require(join(projectDir, PACKAGE_JSON));
        const location: string = projectDir;

        return {
            policyConf,
            files,
            packageJson,
            location,
        };
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

type getProjectFiles<T> = (path: string, policyConfig: PolicyDefinition) => T;

const getProjectFiles: getProjectFiles<FileMap> = (path, policyConfig) => {
    const result: FileMap = new Map();
    for (let relPath of scanProjectFiles(posix.normalize(path), globbyPolicyFilePattern, policyConfig)) {
        try {
            result.set(relPath, fs.readFileSync(join(path, relPath)).toString());
        } catch (error) {
            console.error(error.message);
        }
    }

    return result;
};

type scanProjectFiles = (posixPath: string, globbyPatternCollection: GlobbyPatternCollection, policyConfig: ProjectPolicyConfig) => Array<string>;

const scanProjectFiles: scanProjectFiles = (posixPath, globbyPatternCollection, policyConfig) => {
    return globby.sync(
        [
            ...globbyPatternCollection,
            ...globbyPolicyDefaultPattern,
            ...(policyConfig?.options?.exclude ? policyConfig.options.exclude.map((p) => `!${p}`) : []),
        ],
        {
            onlyFiles: true,
            cwd: posixPath,
        },
    );
};