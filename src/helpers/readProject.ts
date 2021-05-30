import { join, posix } from "path";
import fs from "fs";
import {PolicyData, PolicyDefinition, PolicyOptions, ProjectData} from "src/types";
import {exceptPolicy, filterExcludeFilesFromPolicy, filterFiles} from "../helpers";
import { getErrorMissingPolicyMessage, PACKAGE_JSON, PROJECT_POLICY_CONFIG_FILENAME, PROJECT_POLICY_PREV_CONTENT_FILENAME } from "../constant";
import { FileMap } from "../types/FileMap";
import { FilterCollection } from "../types/other";

export function reloadProjectPolicy(projectData: ProjectData, policies: Map<string, PolicyData>) {
    const {projectDir} = projectData;
    const policyConf: PolicyDefinition = require(join(projectDir, PROJECT_POLICY_CONFIG_FILENAME));
    const policy = exceptPolicy(policies, policyConf.policy, projectDir);


}

export function readProject(projectDir: string, policies: Map<string, PolicyData>): ProjectData {
    const policyConf: PolicyDefinition = require(join(projectDir, PROJECT_POLICY_CONFIG_FILENAME));
    const files: FileMap = getProjectFiles(projectDir, policyConf?.options?.exclude ?? []);
    const packageJson: any = require(join(projectDir, PACKAGE_JSON));
    const prevContentJson: any = require(join(projectDir, PROJECT_POLICY_PREV_CONTENT_FILENAME));
    const prevPolicyFiles: Set<string> = new Set();
    const policy = exceptPolicy(policies, policyConf.policy, projectDir);

    // Generating policy files - start
    const policyGeneratedFiles = new Map();

    for (let [relPath, { generate }] of policy.genFiles.entries()) {
        policyGeneratedFiles.set(relPath.replace(/\.gen\.cjs$/, ""), generate(packageJson ?? {}, policyConf?.options ?? {}));
    }

    const policyFiles: FileMap = filterExcludeFilesFromPolicy(
        new Map([...policy.files, ...policyGeneratedFiles]),
        policyConf.options?.exclude ?? [],
    );
    // Generating policy files - end

    for (let [fileName, fileContent] of files) if (prevContentJson[fileName] === fileContent) prevPolicyFiles.add(fileName);

    return {
        policyConf,
        projectFiles: files,
        packageJson,
        projectDir,
        prevPolicyFiles,
        policy,
        policyFiles,
    };
}

function getProjectFiles(path: string, excludePatternCollection: FilterCollection): FileMap {
    const result: FileMap = new Map();

    for (let relPath of filterFiles(path, undefined, excludePatternCollection)) {
        result.set(relPath, fs.readFileSync(join(path, relPath)).toString());
    }

    return result;
}
