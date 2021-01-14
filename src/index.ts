import { checkPolicy, getLocalModulesPath, isCheckLocalModule, scanCurrentPath, scanPath, policyNotFound, showResult } from "./helpers";
import { PackagesCollection, PolicyData, ProjectData } from "./types";
import chalk from "chalk";

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
        const localModulesPath: string | null = await getLocalModulesPath();

        if (scanLocalModules && localModulesPath != null) {
            console.log("Local Modules Path Found: ", localModulesPath);
            console.log("Start scan Local Modules Packages");
            await scanPath(localModulesPath, scanResult);
        } else {
            console.log("Start scan current path");
            await scanCurrentPath(currentPath, scanResult);
        }
        showResult(scanResult);

        let missingProject = getMissingPolicies(scanResult);
        if (missingProject.size > 0 && localModulesPath) {
            console.log("SOME POLICE NOT FOUND");
            const answer: string = (await policyNotFound()).policyNotFound;
            switch (answer) {
                case "try":
                    if (!isCheckLocalModule(currentPath, localModulesPath)) {
                        await scanPath(localModulesPath, scanResult, true);
                        missingProject = getMissingPolicies(scanResult);
                        if (missingProject.size > 0) removeProjectFromScan(scanResult, missingProject);
                    } else {
                        removeProjectFromScan(scanResult, missingProject);
                    }
                    break;
                case "skip":
                    removeProjectFromScan(scanResult, missingProject);
                    break;
                default:
            }
        }

        for (let projectData of scanResult.projects.values()) {
            try {
                if (scanResult.policies.has(projectData.policyConf.policy)) {
                    const policy: PolicyData = scanResult.policies.get(projectData.policyConf.policy) as PolicyData;
                    console.log("#######################################################");
                    console.log("START CHECK POLICY: ", projectData.policyConf.policy, projectData.location);
                    console.log("#######################################################");
                    await checkPolicy(policy, projectData);
                    console.log("#######################################################");
                } else {
                    const localModulesPath2: string | null = localModulesPath ?? (await getLocalModulesPath());
                    if (localModulesPath2 != null) {
                        await scanPath(localModulesPath2, scanResult, true);
                        console.log("#######################################################");
                        console.log(chalk.red("Policy not found: ", projectData.policyConf.policy));
                        console.log("#######################################################");
                    }
                }
            } catch (error) {
                console.error(error.message);
            }
        }
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

type getMissingPolicies = (packagesCollection: PackagesCollection) => Map<string, string>;

const getMissingPolicies: getMissingPolicies = (packagesCollection) => {
    const result: Map<string, string> = new Map();
    for (let [path, project] of packagesCollection.projects.entries()) {
        const name = project.policyConf.policy;
        if (!packagesCollection.policies.has(name)) result.set(path, name);
    }
    return result;
};

type removeProjectFromScan = (packagesCollection: PackagesCollection, removeCollection: Map<string, string>) => void;

const removeProjectFromScan: removeProjectFromScan = (packagesCollection, removeCollection) => {
    for (let projectPath of removeCollection.keys()) {
        console.log("#######################################################");
        console.log(chalk.red("Remove project from scan: ", projectPath));
        console.log("#######################################################");
        packagesCollection.projects.delete(projectPath);
        showResult(packagesCollection);
    }
};
