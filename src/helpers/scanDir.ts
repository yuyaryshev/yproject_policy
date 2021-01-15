import globby from "globby";
import { join, posix } from "path";
import { POLICY_DEFINITION_FILENAME, PROJECT_POLICY_CONFIG_FILENAME } from "../constant";
import { PackagesCollection } from "../types";
import { readDirRecursive } from "./readDirRecursive";
import { readPolicy } from "./readPolicy";
import { readProject } from "./readProject";
import chalk from "chalk";

type scanDirFunction = (path: string) => boolean;

export const isProject: scanDirFunction = (path) => {
    return Boolean(
        globby.sync(PROJECT_POLICY_CONFIG_FILENAME, {
            onlyFiles: true,
            cwd: posix.normalize(path),
        }).length,
    );
};

export const isPolicy: scanDirFunction = (path) => {
    return Boolean(
        globby.sync(POLICY_DEFINITION_FILENAME, {
            onlyFiles: true,
            cwd: posix.normalize(path),
        }).length,
    );
};

export function loadPolicies(packagesCollection: PackagesCollection, policiesLocation: string) {
    readDirRecursive(policiesLocation, (path, dirEntry) => {
        if (dirEntry.isDirectory()) {
            const joinPath = join(path, dirEntry.name);
            if (isPolicy(joinPath)) {
                const policy = readPolicy(joinPath);
                packagesCollection.policies.set(policy.policy.policy, policy);
                return false;
            }
            return true;
        }
        return false;
    });
}

export function loadProjects(packagesCollection: PackagesCollection, dirPath: string) {
    readDirRecursive(dirPath, (path, dirEntry) => {
        if (dirEntry.isDirectory()) {
            const joinPath = join(path, dirEntry.name);
            if (isProject(joinPath)) {
                packagesCollection.projects.set(joinPath, readProject(joinPath));
                return false;
            }
            return true;
        }
        return false;
    });
}

export function scanCurrentPath(dirPath: string, packagesCollection: PackagesCollection) {
    //(isProject(dirPath)?join(dirPath, "../"):dirPath)
    if (isProject(dirPath)) {
        packagesCollection.projects.set(dirPath, readProject(dirPath));
        try {
            console.log(chalk.red("Trying to find policies at a parent directory"));
            loadProjects(join(dirPath, "../"), packagesCollection, true);
        } catch (error) {
            console.error(error.message);
        }
    } else {
        loadProjects(dirPath, packagesCollection);
    }
}

type isCheckLocalModule = (childPath: string, parentPath: string) => boolean;

export const isCheckLocalModule: isCheckLocalModule = (childPath, parentPath) => {
    return childPath === parentPath || join(childPath, "..") === parentPath;
};
