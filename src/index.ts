import { checkPolicy, getLocalModulesPath, loadProjects, isProject, readProject, checkMissingPolicies, showResult } from "./helpers";
import { PackagesCollection, PolicyData } from "./types";
import { loadPolicies } from "./helpers";
import { LANG_DICTIONARY_DYNAMIC, LANG_DICTIONARY_STATIC } from "./constant";
import { program } from "commander";

const { ERROR_MISSING_LOCAL_PACKAGES_FOLDER, COMMAND_OPTION_ALL_DESCRIPTION } = LANG_DICTIONARY_STATIC;
const { ERROR_MISSING_POLICY_FOR_PROJECT, MESSAGE_START_CHECK_POLICY_FOR_PROJECT } = LANG_DICTIONARY_DYNAMIC;

module.exports.run = async () => {
    try {
        program.option("-a --check-all-local-project", COMMAND_OPTION_ALL_DESCRIPTION);
        program.parse(process.argv);

        const { checkAllLocalProject } = program.opts();

        const packagesCollection: PackagesCollection = {
            policies: new Map(),
            projects: new Map(),
        };

        const localModulesPath: string | undefined = await getLocalModulesPath();

        if (!localModulesPath) {
            console.error(ERROR_MISSING_LOCAL_PACKAGES_FOLDER as string);
            process.exit(1);
        }

        const currentPath: string = checkAllLocalProject ? localModulesPath : process.cwd();

        packagesCollection.policies = new Map([...loadPolicies(localModulesPath)]);

        if (isProject(currentPath)) {
            packagesCollection.projects.set(currentPath, readProject(currentPath));
        } else {
            packagesCollection.projects = new Map([...loadProjects(localModulesPath)]);
        }

        const missingPolicies = checkMissingPolicies(packagesCollection);
        if (missingPolicies.size) {
            console.log("#######################################################");
            for (let [policy, projectDir] of missingPolicies.entries()) {
                console.error(ERROR_MISSING_POLICY_FOR_PROJECT(policy, projectDir));
            }
            console.log("#######################################################");
            process.exit(1);
        }

        //TODO: show funded project & policies
        showResult(packagesCollection);
        //TODO: реализовать и вызвать showPackagesCollections(packagesCollection)
        //TODO: реализовать и вывести шаблонны опросник на запуск применения политик

        for (let projectData of packagesCollection.projects.values()) {
            const policy: PolicyData = packagesCollection.policies.get(projectData.policyConf.policy) as PolicyData;
            console.log(MESSAGE_START_CHECK_POLICY_FOR_PROJECT(projectData.policyConf.policy, projectData.location));
            await checkPolicy(policy, projectData);
        }
        console.log("FINISH");
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};
