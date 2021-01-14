import {relative, join, join as pathJoin} from "path";
import fs from "fs";
import { PolicyData, PolicyDefinition, PolicyFileGenerator, ReadDirCallback } from "src/types";
import { genFilesRegex, readDirRecursive } from "../helpers";
import { POLICY_DEFINITION_FILENAME, EXCLUDE_FROM_POLICY_REGEX } from "../constant";

const { directories: excludeDirs, files: excludeFiles } = EXCLUDE_FROM_POLICY_REGEX;

type readPolicyType = (projectDir: string) => PolicyData;

export const readPolicy: readPolicyType = (projectDir) => {
    let policy: PolicyDefinition | any = undefined;
    const files: Map<string, string> = new Map();
    const genFiles: Map<string, PolicyFileGenerator> = new Map();

    const readPolicyDefinitionCallback: ReadDirCallback = (path, dirEntry) => {
        try {
            const relPath = relative(projectDir, join(path, dirEntry.name));
            if (dirEntry.isFile()) {
                files.set(relPath, fs.readFileSync(join(path, dirEntry.name)).toString());
            }
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
        return false;
    };

    readDirRecursive(projectDir, readPolicyDefinitionCallback);

    return {
        policy,
        files,
        genFiles,
    };
};

const policyPath = pathJoin(process.cwd(), "../yproject_policy_projects/git_policy");
const policy = readPolicy(policyPath);
console.log(policy);