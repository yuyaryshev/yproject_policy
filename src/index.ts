import execa from "execa";
import { join } from "path";
import { isPolicy, isProject, readDirRecursive, readPolicy, readProject } from "./helpers";
import { PackagesCollection, PolicyData, ProjectData } from "./types";

type getLocalModulesPath = () => Promise<string | null>;

const getLocalModulesPath: getLocalModulesPath = async () => {
    const { stdout } = await execa("npm config get", ["local_packages_folder"]);
    return stdout !== "undefined" ? stdout : null;
};

type scanPath = (path: string, scanResult: PackagesCollection, onlyPolicies?: boolean) => Promise<void>;

const scanPath: scanPath = async (dirPath, scanResult, onlyPolicies = false) => {
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

const scanCurrentPath: scanPath = async (dirPath, scanResult) => {
    if (isProject(dirPath)) {
        scanResult.projects.set(dirPath, readProject(dirPath));
        try {
            await scanPath(join(dirPath, "../"), scanResult,true);
        } catch (error) {
            console.error(error.message);
        }
    }
};

module.exports.run = async () => {
    try {
        const args = require("args");
        args.option("all", 'will check all your projects in "local_packages_folder"', false);

        const { all: scanLocalModules } = args.parse(process.argv);

        const scanResult: PackagesCollection = {
            policies: new Map<string, PolicyData>(),
            projects: new Map<string, ProjectData>(),
        };

        const currentPath: string = process.cwd();
        const localModulesPath: string | null = scanLocalModules ? await getLocalModulesPath() : null;

        if (localModulesPath != null) {
            //TODO: вывести сообщение о найденных проектах и политиках
            console.log("Local Modules Path Found: ", localModulesPath);
            console.log("Start scan Local Modules Packages");
            await scanPath(localModulesPath, scanResult);
        } else {
            //TODO: вывести сообщение о найденных проектах и политиках
            console.log("Start scan current path");
            await scanCurrentPath(currentPath, scanResult);
        }
        //TODO: определить найдены ли у всех проектов политики (в scanResult.policies по ключу и scanResult.projects.policyConf.policy)
        console.log(scanResult);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};
