import { checkProject, getLocalModulesPath, isProject, loadPolicies, loadProjects, readProject } from "./helpers";
import { program } from "commander";
import { LOCAL_PACKAGES_FOLDER } from "./constant";
import chalk from "chalk";
import { outputFileSync } from "fs-extra";
import { existsSync } from "fs";

// @ts-ignore
import version from "./version.js";

export async function run() {
    try {
        program.option("-all --check-all-local-project", `will check all your projects in "${LOCAL_PACKAGES_FOLDER}"`);
        program.option("-add [policyName]", `add this project to policy`);
        program.option("-v --version", `outputs current version`);
        program.parse(process.argv);

        const { checkAllLocalProject } = program.opts();
        const localModulesPath = await getLocalModulesPath();
        const currentPath = checkAllLocalProject ? localModulesPath : process.cwd();
        const policies = loadPolicies(localModulesPath);

        if (["-v", "-version", "--version"].includes(process.argv[2])) {
            console.log(version);
            return;
        } else if (["-add"].includes(process.argv[2])) {
            const configFileName = `yproject_policy.cjs`;
            if (existsSync(configFileName)) {
                console.log(chalk.red(`CODE00000186 '${configFileName}' already exits...`));
            } else {
                const query = process.argv[3];
                for (let [, policy] of policies) {
                    if (policy.policyName.toLocaleLowerCase() === query.toLocaleLowerCase()) {
                        const content = `module.exports = {
    policy: "${policy.policyName}",
    exclude: [] // ignore specified directories and files during policy enforcement
    // policy options here
}
`;
                        outputFileSync(configFileName, content, "utf-8");
                        console.log(`Added '${configFileName}' for policy '${policy.policyName}' to current dir.`);
                        return;
                    }
                }
                console.log(chalk.red(`CODE00000187 Policy '${query}' doesn't exist. Maybe you ment one of these?`));
                for (let [, policy] of policies) {
                    if (policy.policyName.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
                        console.log(`yproject_policy -add ${policy.policyName}`);
                }
                return;
            }
        } else if (["-all", "--check-all-local-project"].includes(process.argv[2])) {
            console.log(`CODE00000100 yproject_policy v${version} started. Checking all projects`);
            const projects = loadProjects(localModulesPath, policies);
            for (let projectData of projects.values()) {
                await checkProject(policies, projectData);
            }
        } else if (isProject(currentPath)) {
            console.log(`CODE00000184 yproject_policy v${version} started. Checking only '${currentPath}' project`);
            await checkProject(policies, readProject(currentPath, policies));
        } else {
            console.log(
                `CODE00000185 yproject_policy v${version} started but doesn't know what to check. Add this folder to a policy? Or start with '-a' to check all projects`,
            );
        }

        console.log(chalk.green("CODE00000095 yproject_policy exits..."));
    } catch (error) {
        console.error("CODE00000096", error.message);
        process.exit(1);
    }
}
