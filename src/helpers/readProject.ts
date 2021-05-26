import { join, posix } from "path";
import fs from "fs";
import { FilterCollection, PolicyDefinition, ProjectData } from "src/types";
import { filterFiles } from "../helpers";
import { PACKAGE_JSON, PROJECT_POLICY_CONFIG_FILENAME, PROJECT_POLICY_PREV_CONTENT_FILENAME } from "../constant";
import { FileMap } from "../types/FileMap";

export function readProject(projectDir: string): ProjectData {
    const policyConf: PolicyDefinition = require(join(projectDir, PROJECT_POLICY_CONFIG_FILENAME));
    const files: FileMap = getProjectFiles(projectDir, policyConf?.options?.exclude ?? []);
    const packageJson: any = require(join(projectDir, PACKAGE_JSON));
    const prevContentJson: any = require(join(projectDir, PROJECT_POLICY_PREV_CONTENT_FILENAME));
    const location: string = projectDir;
    const prevPolicyFiles: Set<string> = new Set();

    for (let [fileName, fileContent] of files) if (prevContentJson[fileName] === fileContent) prevPolicyFiles.add(fileName);

    return {
        policyConf,
        projectFiles: files,
        packageJson,
        projectDir: location,
        prevPolicyFiles,
    };
}

function getProjectFiles(path: string, excludePatternCollection: FilterCollection): FileMap {
    const result: FileMap = new Map();

    for (let relPath of filterFiles(path, undefined, excludePatternCollection)) {
        result.set(relPath, fs.readFileSync(join(path, relPath)).toString());
    }

    return result;
}
