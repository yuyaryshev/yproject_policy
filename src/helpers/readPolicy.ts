import { join, posix } from "path";
import { FileMap, GenFilesMap, FilterCollection, PolicyData, PolicyDefinition } from "src/types";
import { POLICY_DEFINITION_FILENAME } from "../constant";
import { filterPolicy } from "./index";
import { genFileFilter, policyFileFilter } from "../filter";
import fs from "fs";

export function readPolicy(projectDir: string): PolicyData {
    const policy: PolicyDefinition = require(join(projectDir, POLICY_DEFINITION_FILENAME));
    const genFiles: GenFilesMap = getGenPolicyFiles(projectDir, policy?.options?.exclude ?? []);
    const files: FileMap = getPolicyFiles(projectDir, policy?.options?.exclude ?? []);

    return {
        policy,
        genFiles,
        files,
    };
}

function getGenPolicyFiles(path: string, excludePatternCollection: FilterCollection): GenFilesMap {
    const result = new Map();
    for (let relPath of filterPolicy(posix.normalize(path), genFileFilter, excludePatternCollection)) {
        result.set(relPath, require(join(path, relPath)));
    }
    return result;
}

function getPolicyFiles(path: string, excludePatternCollection: FilterCollection): FileMap {
    const result = new Map();

    for (let relPath of filterPolicy(posix.normalize(path), policyFileFilter, excludePatternCollection)) {
        result.set(relPath, fs.readFileSync(join(path, relPath)).toString());
    }
    return result;
}
