import { join, resolve, posix } from "path";
import { PolicyData, PolicyDefinition } from "src/types";
import { genFileFilter, POLICY_DEFINITION_FILENAME } from "../constant";
import fs from "fs";
import { dirFilesOnly, filterFiles } from "./filterProjectContent";
import { FileMap, GenFilesMap } from "../types/FileMap";
import { FilterCollection } from "../types/other";
import chalk from "chalk";

export function readPolicy(projectDir: string): PolicyData {
    const policyDefinition: PolicyDefinition = require(join(projectDir, POLICY_DEFINITION_FILENAME));
    const policyName = policyDefinition.policy;
    const options = policyDefinition.options || {};

    const excludeFilter = options?.exclude ?? [];
    const files0 = filterFiles(dirFilesOnly(projectDir), genFileFilter, excludeFilter);
    const genFiles: GenFilesMap = new Map();
    for (let relPath of files0) {
        const fullname = resolve(projectDir, relPath);
        try {
            genFiles.set(relPath, require(fullname));
        } catch (e) {
            console.error(chalk.bgRed.white(`CODE00000188 failed to require file '${fullname}', error:\n`, e));
        }
    }

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
