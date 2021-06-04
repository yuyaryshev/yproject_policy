import { join, resolve, posix } from "path";
import { PolicyData, PolicyDefinition } from "src/types";
import { genFileFilter, POLICY_DEFINITION_FILENAME } from "../constant";
import fs from "fs";
import { dirFilesOnly, filterFiles } from "./filterProjectContent";
import { FileMap, GenFilesMap } from "../types/FileMap";
import { FilterCollection } from "../types/other";

export function readPolicy(projectDir: string): PolicyData {
    const policyDefinition: PolicyDefinition = require(join(projectDir, POLICY_DEFINITION_FILENAME));
    const policyName = policyDefinition.policy;
    const options = policyDefinition.options || {};

    const excludeFilter = options?.exclude ?? [];
    const files0 = filterFiles(dirFilesOnly(projectDir), genFileFilter, excludeFilter);
    const genFiles: GenFilesMap = new Map();
    for (let relPath of files0) genFiles.set(relPath, require(join(projectDir, relPath)));

    const files: FileMap = new Map();
    const files2 = filterFiles(dirFilesOnly(projectDir), "**", [genFileFilter, ...excludeFilter]);
    for (let relPath of files2) files.set(relPath, fs.readFileSync(join(projectDir, relPath)).toString());

    return {
        policyName,
        options,
        policyAbsPath: resolve(projectDir),
        genFiles,
        files,
    };
}
