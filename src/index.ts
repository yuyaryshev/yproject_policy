import {
    checkPolicy, getLocalModulesPath, isCheckLocalModule, scanCurrentPath, loadProjects, policyNotFound, showResult,
    isProject, readProject, showQuestion
} from "./helpers";
import { PackagesCollection, PolicyData, ProjectData } from "./types";
import chalk from "chalk";
import * as args from "args";
import { checkOneProject } from "./checkOneProject";
import { checkAllProjects } from "./checkAllProject";
import { LOCAL_PACKAGES_FOLDER, POLICY_NOT_FOUND } from "./constant";
import { loadPolicies } from "./helpers/scanDir";

module.exports.run = async () => {
    try {
        args.option("all", 'will check all your projects in "local_packages_folder"', false);

        const { all: scanLocalModules } = args.parse(process.argv);

        const scanResult: PackagesCollection = {
            policies: new Map<string, PolicyData>(),
            projects: new Map<string, ProjectData>(),
        };

        const currentPath: string = process.cwd();
        const localModulesPath: string | null = await getLocalModulesPath();
        //

        // Находимся в папке с проектами и хотим проверить их всех
        // checkAllProjects

        // c:\LOCAL_PACKAGES_FOLDER  <---- LOCAL_PACKAGES_FOLDER
        //      policy1
        //      project1
        //      project2
        //      project3
        //      project4
        //      policy2
        //      local_package1
        //      local_package2
        //      local_package3

        if(!localModulesPath) {
            console.error(`CODE00000000 Please use 'npm config set ${LOCAL_PACKAGES_FOLDER}' to define projects folder.`);
            process.exit(1);
        }

        const packagesCollection:PackagesCollection = {
            policies: new Map(),
            projects:new  Map(),
        };

        loadPolicies( packagesCollection,localModulesPath);

        // Находимся в проекте, хотим его проверить
        if (isProject(currentPath)) {
            packagesCollection.projects.set(currentPath, readProject(currentPath));
            // TODO checkOneProject(currentPath);
        } else {
            loadProjects(scanResult, localModulesPath);
            // TODO checkAllProjects(localModulesPath);
        }

        // if (scanLocalModules && localModulesPath != null) {
        //     console.log("Local Modules Path Found: ", localModulesPath);
        //     console.log("Start scan Local Modules Packages");
        //     loadProjects(scanResult, localModulesPath);
        // } else {
        //     console.log("Start scan current path");
        //     scanCurrentPath(currentPath, scanResult);
        // }
        showResult(scanResult);

        let missingProject = getMissingPolicies(scanResult);
        if (missingProject.size > 0 && localModulesPath) {
            console.log("SOME POLICE NOT FOUND");
            if (!isCheckLocalModule(currentPath, localModulesPath) && !scanLocalModules) {
                const answer: string = (await showQuestion(POLICY_NOT_FOUND)).answer;
                switch (answer) {
                    case "try":
                        await loadProjects(scanResult, localModulesPath, true);
                        missingProject = getMissingPolicies(scanResult);
                        if (missingProject.size > 0) removeProjectFromScan(scanResult, missingProject);
                        break;
                    case "skip":
                        removeProjectFromScan(scanResult, missingProject);
                        break;
                    default:
                }
            } else {
                removeProjectFromScan(scanResult, missingProject);
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
                        await loadProjects(scanResult, localModulesPath2, true);
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
    console.log("#######################################################");
    console.log("FINISH");
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
    for (let [path, policy] of removeCollection.entries()) {
        console.log("#######################################################");
        console.log(chalk.red("Remove project from scan: ", path, " Policy: ", policy));
        console.log("#######################################################");
        packagesCollection.projects.delete(path);
        showResult(packagesCollection);
    }
};
