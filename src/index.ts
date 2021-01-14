// @ts-ignore
import execa from "execa";
import { join } from "path";
import { checkPolicy, isPolicy, isProject, readDirRecursive, readPolicy, readProject } from "./helpers";
import { PackagesCollection, PolicyData, ProjectData } from "./types";
import { match, additional, policyNotFound, showResult} from "./helpers"
import {assertWhileStatement} from "@babel/types";

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
            await scanPath(join(dirPath, "../"), scanResult, true);
        } catch (error) {
            console.error(error.message);
        }
    }
};

type showPolicies = (scanResult: PackagesCollection) => Promise<void>;


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
            showResult(scanResult)
        } else {
            //TODO: вывести сообщение о найденных проектах и политиках
            console.log("Start scan current path");
            await scanCurrentPath(currentPath, scanResult);
            showResult(scanResult)
        }
        //console.log(scanResult);
        //TODO: определить найдены ли у всех проектов политики (в scanResult.policies по ключу и scanResult.projects.policyConf.policy) добавить интерактивность выбора

        for (let projectData of scanResult.projects.values()) {
            try {
                const policyName = projectData.policyConf?.policy;
                if (policyName && scanResult.policies.has(policyName)) {
                    console.log("#######################################################");
                    console.log("START CHECK POLICY: ", policyName, projectData.location);
                    console.log("#######################################################");
                    // @ts-ignore
                    checkPolicy(scanResult.policies.get(policyName), projectData);
                    console.log("#######################################################");
                }
                else {
                    const localModulesPath2: string | null = localModulesPath ?? await getLocalModulesPath();
                    if (localModulesPath2 != null) {
                        await scanPath(localModulesPath2, scanResult, true)
                        console.log("#######################################################");
                        console.log("Policy not found: " ,policyName);
                        console.log("#######################################################");
                    }
                }
            } catch (error) {
                console.error(error.message);
            }
        }
        const checkPolicyManually = (prom:string) => {
            if (prom == "Try" && localModulesPath !== null) {
                scanPath(currentPath, scanResult);
            }
        }
        await policyNotFound().then(prom => checkPolicyManually(prom.policyNotFound))
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};
