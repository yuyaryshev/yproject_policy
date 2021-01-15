import { join, posix } from "path";
import fs from "fs";
import { FileMap, FilterCollection, PolicyDefinition, ProjectData } from "src/types";
import { filterProject } from "../helpers";
import { PROJECT_POLICY_CONFIG_FILENAME, PACKAGE_JSON } from "../constant";

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

    for (let relPath of filterProject(posix.normalize(path), excludePatternCollection)) {
        result.set(relPath, fs.readFileSync(join(path, relPath)).toString());
    }

    return result;
}
