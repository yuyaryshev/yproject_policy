import { relative, join, toNamespacedPath, normalize ,posix} from "path";
import fs from "fs";
import { POLICY_DEFINITION_FILENAME } from "src/constant";
import { PolicyData, PolicyFileGenerator, ReadDirCallback } from "src/types";
import { readDirRecursive } from "./readDirRecursive";
import { genFilesRegex } from "./regex";

type readPolicyType = (projectDir: string) => PolicyData;

export const readPolicy: readPolicyType = (projectDir) => {
    const policyData: PolicyData = {
        policy: undefined,
        files: new Map<string, string>(),
        genFiles: new Map<string, PolicyFileGenerator>(),
    };

    const readPolicyDefinitionCallback: ReadDirCallback = (path, dirEntry) => {
        try {
            if (dirEntry.isFile() && dirEntry.name === POLICY_DEFINITION_FILENAME) {
                console.log("FIND POLICY DEFINITION: ", relative(projectDir, join(path, dirEntry.name)));
                policyData.policy = require(join(path, dirEntry.name));
            }
            return false;
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
    };

    const readPolicyCallback: ReadDirCallback = (path, dirEntry) => {
        try {
            const relPath = relative(projectDir, join(path, dirEntry.name));
            if (dirEntry.isDirectory()) {
                console.log("FIND DIRECTORY: ", relPath);
                // if (policyData?.policy?.defaultOptions?.exclude) {
                //     console.log("PATH!!!!: ", relPath);
                //     return (
                //         policyData.policy.defaultOptions.exclude.find((excludePath) => {
                //             let pattern = new RegExp("^(.?/)?" + (excludePath+""));
                //             console.log("$$$$$$$$$$$$$$$$$$$");
                //             console.log("PATTERN: ", pattern.source);
                //             console.log("PPATH: ", relPath);
                //             console.log("RESULT: ", posix.normalize(relPath).match(pattern));
                //             console.log("$$$$$$$$$$$$$$$$$$$");
                //             return posix.normalize(relPath).match(pattern);
                //         }) !== null
                //     );
                // }
                return true;
            } else {
                if (dirEntry.name !== POLICY_DEFINITION_FILENAME) {
                    if (dirEntry.name.match(genFilesRegex)) {
                        console.log("FIND GEN FILE: ", relPath);
                        policyData.genFiles.set(relPath, require(join(path, dirEntry.name)));
                    } else {
                        console.log("FIND OTHER FILE: ", relPath);
                        policyData.files.set(relPath, fs.readFileSync(join(path, dirEntry.name)).toString());
                    }
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

    return policyData;
};
