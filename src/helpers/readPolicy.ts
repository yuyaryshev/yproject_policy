import { join, resolve, posix } from "path";
import { PolicyData, PolicyDefinition } from "../types/index.js";
import { genFileFilter, POLICY_DEFINITION_FILENAME } from "../constant/index.js";
import fs from "fs";
import { dirFilesOnly, filterFiles } from "./filterProjectContent.js";
import { FileMap, GenFilesMap } from "../types/FileMap.js";
import { FilterCollection } from "../types/other.js";
import chalk from "chalk";

export function readPolicy(projectDir: string): PolicyData {
    const policyDefinition: PolicyDefinition = require(join(projectDir, POLICY_DEFINITION_FILENAME));
    const policyName = policyDefinition.policy;
    const options = policyDefinition.options || {};

    const excludeFilter = options?.exclude ?? [];
    const files0 = filterFiles(dirFilesOnly(projectDir, policyDefinition), genFileFilter, excludeFilter);
    const genFiles: GenFilesMap = new Map();
    for (const relPath of files0) {
        const fullname = resolve(projectDir, relPath);
        try {
            genFiles.set(relPath, require(fullname));
        } catch (e) {
            console.error(chalk.bgRed.white(`CODE00000188 failed to require file '${fullname}', error:\n`, e));
        }
    }

    const files: FileMap = new Map();
    const files2 = filterFiles(dirFilesOnly(projectDir, policyDefinition), "**", [genFileFilter, ...excludeFilter]);
    for (const relPath of files2) files.set(relPath, fs.readFileSync(join(projectDir, relPath)).toString());

    return {
        policyDefinition,
        policyName,
        options,
        policyAbsPath: resolve(projectDir),
        genFiles,
        files,
        create: policyDefinition.create,
    };
}
