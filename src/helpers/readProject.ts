import { join, posix } from "path";
import fs from "fs";
import { FileMap, FilterCollection, PolicyDefinition, ProjectData } from "src/types";
import { filterFiles } from "../helpers";
import { PACKAGE_JSON, PROJECT_POLICY_CONFIG_FILENAME } from "../constant";

export function readProject(projectDir: string): ProjectData {
    const policyConf: PolicyDefinition = require(join(projectDir, PROJECT_POLICY_CONFIG_FILENAME));
    const files: FileMap = getProjectFiles(projectDir, policyConf?.options?.exclude ?? []);
    const packageJson: object = require(join(projectDir, PACKAGE_JSON));
    const location: string = projectDir;

    return {
        policyConf,
        files,
        packageJson,
        location,
    };
}

function getProjectFiles(path: string, excludePatternCollection: FilterCollection): FileMap {
    const result: FileMap = new Map();

    for (let relPath of filterFiles(posix.normalize(path), undefined, excludePatternCollection)) {
        result.set(relPath, fs.readFileSync(join(path, relPath)).toString());
    }

    return result;
}
