import { relative, join } from "path";
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
            if (dirEntry.isFile() && dirEntry.name === POLICY_DEFINITION_FILENAME) {
                console.log("FIND POLICY DEFINITION: ", relative(projectDir, join(path, dirEntry.name)));
                policy = require(join(path, dirEntry.name));
            }
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
        return false;
    };

    const readPolicyCallback: ReadDirCallback = (path, dirEntry) => {
        try {
            const relPath = relative(projectDir, join(path, dirEntry.name));
            if (dirEntry.isDirectory()) {
                let check = !excludeDirs.find((pattern) => dirEntry.name.match(pattern));
                console.log("FIND DIRECTORY: ", relPath, check);
                return check;
            }
            if (dirEntry.name !== POLICY_DEFINITION_FILENAME && !excludeFiles.find((pattern) => dirEntry.name.match(`${pattern}$`))) {
                if (dirEntry.name.match(genFilesRegex)) {
                    console.log("FIND GEN FILE: ", relPath);
                    genFiles.set(relPath.replace(genFilesRegex, ""), require(join(path, dirEntry.name)));
                } else {
                    console.log("FIND OTHER FILE: ", relPath);
                    files.set(relPath, fs.readFileSync(join(path, dirEntry.name)).toString());
                }
            }
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
        return false;
    };

    readDirRecursive(projectDir, readPolicyDefinitionCallback);
    readDirRecursive(projectDir, readPolicyCallback);

    return {
        policy,
        files,
        genFiles,
    };
};
