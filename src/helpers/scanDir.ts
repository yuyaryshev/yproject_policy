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

type scanPath = (path: string, scanResult: PackagesCollection, onlyPolicies?: boolean) => Promise<void>;

export const scanPath: scanPath = async (dirPath, scanResult, onlyPolicies = false) => {
    readDirRecursive(dirPath, (path, dirEntry) => {
        if (dirEntry.isDirectory()) {
            const joinPath = join(path, dirEntry.name);
            if (isPolicy(joinPath)) {
                const policy = readPolicy(joinPath);
                scanResult.policies.set(policy.policy.policy, policy);
                return false;
            }
            if (!onlyPolicies && isProject(joinPath)) {
                scanResult.projects.set(joinPath, readProject(joinPath));
                return false;
            }
            return true;
        }
        return false;
    });
};

type scanCurrentPath = (path: string, scanResult: PackagesCollection) => Promise<void>;

export const scanCurrentPath: scanCurrentPath = async (dirPath, scanResult) => {
    if (isProject(dirPath)) {
        scanResult.projects.set(dirPath, readProject(dirPath));
        try {
            //TODO: вывести сообщение что будет осуществлен поиск политик в родительской директории
            console.log(chalk.red("Trying to find policies at a parent directory"))
            await scanPath(join(dirPath, "../"), scanResult, true);
        } catch (error) {
            console.error(error.message);
        }
    } else {
        await scanPath(dirPath, scanResult);
    }
};

type isCheckLocalModule = (childPath: string, parentPath: string) => boolean;

export const isCheckLocalModule: isCheckLocalModule = (childPath, parentPath) => {
    return childPath === parentPath || join(childPath, "..") === parentPath;
};
