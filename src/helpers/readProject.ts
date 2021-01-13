import { relative, join } from "path";
import fs from "fs";
import {ProjectData, PolicyFileGenerator, ReadDirCallback, ProjectPolicyConfig, FileMap} from "src/types";
import { readDirRecursive } from "./readDirRecursive";
import { genFilesRegex } from "./regex";
import { PROJECT_POLICY_CONFIG_FILENAME, EXCLUDE_FROM_PROJECT_REGEX } from "../constant";


const { directories: excludeDirs, files: excludeFiles } = EXCLUDE_FROM_PROJECT_REGEX;

type readProjectType = (projectDir: string) => ProjectData;

export const readProject: readProjectType = (projectDir) => {
    const projectData: ProjectData = {
        policyConf: undefined,
        files: new Map<string, string>(),
        packageJson: undefined,
        location: projectDir,
    };

    const readProjectDefinitionCallback: ReadDirCallback = (path, dirEntry) => {
        try {
            if (dirEntry.isFile() && dirEntry.name === PROJECT_POLICY_CONFIG_FILENAME) {
                console.log("FIND PROJECT POLICY CONFIG: ", relative(projectDir, join(path, dirEntry.name)));
                projectData.policyConf = require(join(path, dirEntry.name));
            }
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
        return false;
    };

    const readProjectCallback: ReadDirCallback = (path, dirEntry) => {
        try {
            const relPath = relative(projectDir, join(path, dirEntry.name));
            if (dirEntry.isDirectory()) {
                let check = !excludeDirs.find(pattern => (dirEntry.name.match(pattern)));
                console.log("FIND DIRECTORY: ", relPath, check);
                return check;
            } else {
                if (dirEntry.name !== PROJECT_POLICY_CONFIG_FILENAME && !excludeFiles.find(pattern => (dirEntry.name.match(pattern)))) {
                    console.log("FIND OTHER FILE: ", relPath);
                    projectData.files.set(relPath, fs.readFileSync(join(path, dirEntry.name)).toString());

                }
            }
        } catch (error) {
            console.error(error.message);
            process.exit(1);
        }
        return false;
    };

    readDirRecursive(projectDir, readProjectDefinitionCallback);
    readDirRecursive(projectDir, readProjectCallback);

    return projectData;
};
