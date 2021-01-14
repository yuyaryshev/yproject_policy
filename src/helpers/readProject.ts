import {relative, join, posix} from "path";
import fs from "fs";
import {
    FileMap,
    GenFilesMap,
    GlobbyPatternCollection,
    PolicyData,
    PolicyDefinition,
    ProjectData,
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
    const projectData: ProjectData = {
        policyConf: undefined,
        files: new Map<string, string>(),
        packageJson: undefined,
        location: projectDir,
    };

    const readProjectDefinitionCallback: ReadDirCallback = (path, dirEntry) => {
        try {
            if (dirEntry.isFile()) {
                if (dirEntry.name === PROJECT_POLICY_CONFIG_FILENAME) {
                    console.log("FIND PROJECT POLICY CONFIG: ", relative(projectDir, join(path, dirEntry.name)));
                    projectData.policyConf = require(join(path, dirEntry.name));
                }
                if (dirEntry.name === PACKAGE_JSON) {
                    console.log("FIND PROJECT PACKAGE JSON: ", relative(projectDir, join(path, dirEntry.name)));
                    projectData.packageJson = require(join(path, dirEntry.name));
                }
            }
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
        return false;
    };

    const readProjectCallback: ReadDirCallback = (path, dirEntry) => {
        try {
            const relPath = relative(projectDir, join(path, dirEntry.name));
            if (dirEntry.isDirectory()) {
                return !excludeDirs.find((pattern) => dirEntry.name.match(pattern));
            } else {
                if (
                    dirEntry.name !== PROJECT_POLICY_CONFIG_FILENAME &&
                    dirEntry.name !== PACKAGE_JSON &&
                    !excludeFiles.find((pattern) => dirEntry.name.match(pattern))
                ) {
                    projectData.files.set(relPath, fs.readFileSync(join(path, dirEntry.name)).toString());
                }
            }
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
        return false;
    };

    readDirRecursive(projectDir, readProjectDefinitionCallback);
    readDirRecursive(projectDir, readProjectCallback);

    return projectData;
};





export const readProjec: readProjectType = (projectDir:string) => {
    try {
        const policy: PolicyDefinition = require(join(projectDir, PROJECT_POLICY_CONFIG_FILENAME));
        const files: FileMap = getProjectFiles(projectDir, policy);
        const packageJson: object = require(join(projectDir, PACKAGE_JSON));
        const location: string = projectDir;

        return {
            policy,
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

type scanProjectFiles = (posixPath: string, globbyPatternCollection: GlobbyPatternCollection, policyConfig: PolicyDefinition) => Array<string>;

const scanProjectFiles: scanProjectFiles = (posixPath, globbyPatternCollection, policyConfig) => {
    return globby.sync(
        [
            ...globbyPatternCollection,
            ...globbyPolicyDefaultPattern,
            ...(policyConfig.defaultOptions.exclude ? policyConfig.defaultOptions.exclude.map((p) => `!${p}`) : []),
        ],
        {
            onlyFiles: true,
            cwd: posixPath,
        },
    );
};

readProjec("C:\\Users\\Ravil\\Documents\\GitHub\\yproject_policy_projects\\test_project")