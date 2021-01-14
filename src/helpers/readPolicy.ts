import { join, posix } from "path";
import globby from "globby";
import { FileMap, GenFilesMap, GlobbyPatternCollection, PolicyData, PolicyDefinition } from "src/types";
import { POLICY_DEFINITION_FILENAME } from "../constant";
import { globbyGenFilePattern, globbyPolicyDefaultPattern, globbyPolicyFilePattern } from "./regex";
import fs from "fs";

type readPolicyType = (projectDir: string) => PolicyData;

export const readPolicy: readPolicyType = (projectDir) => {
    try {
        const policy: PolicyDefinition = require(join(projectDir, POLICY_DEFINITION_FILENAME));
        const genFiles: GenFilesMap = getGenPolicyFiles(projectDir, policy);
        const files: FileMap = getPolicyFiles(projectDir, policy);

        return {
            policy,
            genFiles,
            files,
        };
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

type scanPolicyFiles = (posixPath: string, globbyPatternCollection: GlobbyPatternCollection, policyConfig: PolicyDefinition) => Array<string>;

const scanPolicyFiles: scanPolicyFiles = (posixPath, globbyPatternCollection, policyConfig) => {
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

type getPolicyFiles<T> = (path: string, policyConfig: PolicyDefinition) => T;

const getGenPolicyFiles: getPolicyFiles<GenFilesMap> = (path, policyConfig) => {
    const result: GenFilesMap = new Map();
    for (let relPath of scanPolicyFiles(posix.normalize(path), globbyGenFilePattern, policyConfig)) {
        try {
            result.set(relPath, require(join(path, relPath)));
        } catch (error) {
            console.error(error.message);
        }
    }

    return result;
};

const getPolicyFiles: getPolicyFiles<FileMap> = (path, policyConfig) => {
    const result: FileMap = new Map();
    for (let relPath of scanPolicyFiles(posix.normalize(path), globbyPolicyFilePattern, policyConfig)) {
        try {
            result.set(relPath, fs.readFileSync(join(path, relPath)).toString());
        } catch (error) {
            console.error(error.message);
        }
    }

    return result;
};
