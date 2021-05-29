import { join, resolve, posix } from "path";
import { PolicyData, PolicyDefinition } from "src/types";
import { genFileFilter, POLICY_DEFINITION_FILENAME } from "../constant";
import fs from "fs";
import { filterFiles } from "./filterProjectContent";
import {FileMap, GenFilesMap} from "../types/FileMap";
import {FilterCollection} from "../types/other";

export function readPolicy(projectDir: string): PolicyData {
    const policy: PolicyDefinition = require(join(projectDir, POLICY_DEFINITION_FILENAME));
    const genFiles: GenFilesMap = getGenPolicyFiles(projectDir, policy?.options?.exclude ?? []);
    const files: FileMap = getPolicyFiles(projectDir, policy?.options?.exclude ?? []);

    return {
        policy,
        policyAbsPath: resolve(projectDir),
        genFiles,
        files,
    };
}

function getGenPolicyFiles(path: string, excludePatternCollection: FilterCollection): GenFilesMap {
    const result = new Map();
    for (let relPath of filterFiles(path, genFileFilter, excludePatternCollection)) {
        result.set(relPath, require(join(path, relPath)));
    }
    return result;
}

function getPolicyFiles(path: string, excludePatternCollection: FilterCollection): FileMap {
    const result = new Map();

    for (let relPath of filterFiles(path, undefined, [genFileFilter, ...excludePatternCollection])) {
        result.set(relPath, fs.readFileSync(join(path, relPath)).toString());
    }
    return result;
}
