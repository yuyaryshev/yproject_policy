import { checkProject, getNpmConfig, isProject, loadPolicies, loadProjects, readProject } from "./helpers/index.js";
import { program } from "commander";
import { NPM_CONF_LOCAL_PACKAGES_FOLDER } from "./constant/index.js";
import chalk from "chalk";
import { outputFileSync } from "fs-extra";
import { existsSync } from "fs";
import { join, basename } from "path";
import { version } from "./projmeta.js";
import { expectNpmConfigKeyString } from "./helpers/getNpmConfig.js";

export async function run() {
    let projectsProcessed = 0;
    try {
        program.option("-all --check-all-local-project", `will check all your projects in "${NPM_CONF_LOCAL_PACKAGES_FOLDER}"`);
        program.option("-add [policyName]", `add this project to policy`);
        program.option("-gengit --gengit", `generate git commands for all policy projects`);
        program.option("-v --version", `outputs current version`);
        program.option(
            "-create --create [policyName]",
            `Used to create a new policy based project in current folder. The folder should be already cloned from a git repo.`,
        );
        program.option("-l --list", `list all projects under policy "${NPM_CONF_LOCAL_PACKAGES_FOLDER}"`);
        program.option("-ls --ls", `list all projects under policy "${NPM_CONF_LOCAL_PACKAGES_FOLDER}"`);
        program.parse(process.argv);

        const { checkAllLocalProject } = program.opts();
        const localModulesPath = await expectNpmConfigKeyString(NPM_CONF_LOCAL_PACKAGES_FOLDER);
        const currentPath = checkAllLocalProject ? localModulesPath : process.cwd();
        const policies = await loadPolicies();

        if (["-v", "-version", "--version"].includes(process.argv[2])) {
            console.log(version);
            return;
        } else if (["-add", "--add", "-create", "--create"].includes(process.argv[2])) {
            const configFileName = `yproject_policy.cjs`;
            if (existsSync(configFileName)) {
                console.log(chalk.red(`CODE00000186 '${configFileName}' already exits...`));
            } else {
                const query = process.argv[3] || (policies.size === 1 ? [...policies.values()][0].policyName : "");
                for (const [, policy] of policies) {
                    if (policy.policyName.toLocaleLowerCase() === query.toLocaleLowerCase()) {
                        const content = `module.exports = {
    policy: "${policy.policyName}",
    exclude: [] // ignore specified directories and files during policy enforcement
    // policy options here
}
`;
                        outputFileSync(configFileName, content, "utf-8");
                        console.log(`Added '${configFileName}' for policy '${policy.policyName}' to current dir.`);

                        if (process.argv[2].includes("create") && policy.create) {
                            // Call policy.create script here
                            await policy.create?.(configFileName);
                        }
                        return;
                    }
                }
                console.log(chalk.red(`CODE00000187 Policy '${query}' doesn't exist. Maybe you ment one of these?`));
                for (const [, policy] of policies) {
                    if (policy.policyName.toLocaleLowerCase().includes(query.toLocaleLowerCase())) {
                        console.log(`yproject_policy -add ${policy.policyName}`);
                        console.log(`yproject_policy -create ${policy.policyName}`);
                    }
                }
                return;
            }
        } else if (["-all", "--check-all-local-project"].includes(process.argv[2])) {
            console.log(`CODE00000190 yproject_policy v${version} started. Checking all projects`);
            const projects = loadProjects(localModulesPath, policies);
            for (const projectData of projects.values()) {
                await checkProject(policies, projectData);
                projectsProcessed++;
            }
        } else if (["-l", "--list", "-ls", "--ls"].includes(process.argv[2])) {
            const projects = loadProjects(localModulesPath, policies);
            for (const projectData of projects.values()) {
                console.log(projectData.projectDir);
            }
        } else if (["-gengit", "--gengit"].includes(process.argv[2])) {
            console.log(`CODE00000191 yproject_policy v${version} started. Checking all projects`);
            const projects = loadProjects(localModulesPath, policies);
            const pushAllLines: string[] = [];
            const addAndPushAllLines: string[] = [];
            const pullAllLines: string[] = [];
            const pullAllAndBuildLines: string[] = [];
            const pullAllpnpmiLines: string[] = [];
            const hardResetAndPullLines: string[] = [];
            const cloneAllLines: string[] = [
                localModulesPath.includes(":") ? localModulesPath.substr(0, 1 + localModulesPath.indexOf(":")) : "",
                `cd ${localModulesPath}`,
            ];

            for (const projectData of projects.values()) {
                const { projectDir } = projectData;
                const projectName = basename(projectDir);
                const pushLine = `cd ${projectDir} & git add --all && git commit -a -m push_all && git push origin`;
                addAndPushAllLines.push(pushLine);
                pushAllLines.push(pushLine.split("git add --all && ").join(""));

                const pullLine = `cmd /c "d: && cd ${projectDir} & git pull & pnpm i && pnpm run build"`;
                pullAllAndBuildLines.push(pullLine);
                pullAllLines.push(pullLine.split("& pnpm i && pnpm run build").join(""));
                pullAllpnpmiLines.push(pullLine.split(" && pnpm run build").join(""));

                const hardResetAndPullLine = `cmd /c "d: && cd ${projectDir} & git reset --hard origin/master & git reset --hard origin/main & git pull "`;
                hardResetAndPullLines.push(hardResetAndPullLine);

                cloneAllLines.push(`git clone http://git.yyadev.com/yuyaryshev/${projectName}.git`);
                cloneAllLines.push(`git clone https://github.com/yuyaryshev/${projectName}.git`);
            }

            const pushAllCmd = pushAllLines.join("\n");
            const addAndPushAllCmd = addAndPushAllLines.join("\n");
            const pullAllCmd = pullAllLines.join("\n");
            const pullAllAndBuildCmd = pullAllAndBuildLines.join("\n");
            const pullAllpnpmiCmd = pullAllpnpmiLines.join("\n");
            const hardResetAndPullCmd = hardResetAndPullLines.join("\n");
            const cloneAllLinesCmd = cloneAllLines.join("\n");

            const targetDir = process.argv[3];
            if (targetDir) {
                outputFileSync(join(targetDir, "push_all.bat"), pushAllCmd);
                outputFileSync(join(targetDir, "add_and_push_all.bat"), addAndPushAllCmd);
                outputFileSync(join(targetDir, "pull_all.bat"), pullAllCmd);
                outputFileSync(join(targetDir, "pull_all_and_build.bat"), pullAllAndBuildCmd);
                outputFileSync(join(targetDir, "pull_all_pnpmi.bat"), pullAllpnpmiCmd);
                outputFileSync(join(targetDir, "hard_reset_all.bat"), hardResetAndPullCmd);
                outputFileSync(join(targetDir, "clone_all.bat"), cloneAllLinesCmd);
                console.log(`Written bat files to ${targetDir}`);
            } else
                console.log(`
Push all:
${pushAllCmd}

Add and push all:
${addAndPushAllCmd}

Pull all:
${pullAllCmd}

Pull all anf build:
${pullAllAndBuildCmd}

hardResetAndPullCmd:
${hardResetAndPullCmd}

cloneAllLinesCmd:
${cloneAllLinesCmd}
                    
                                `);
        } else if (isProject(currentPath)) {
            console.log(`CODE00000184 yproject_policy v${version} started. Checking only '${currentPath}' project`);
            await checkProject(policies, readProject(currentPath, policies));
            projectsProcessed++;
        } else {
            console.log(
                `CODE00000185 yproject_policy v${version} started but doesn't know what to check. Add this folder to a policy? Or start with '-a' to check all projects`,
            );
        }

        console.log(chalk.green(`CODE00000095 ${projectsProcessed ? `Done ${projectsProcessed} projects. ` : ""}yproject_policy exits...`));
    } catch (error: any) {
        console.error("CODE00000096", error.message);
        process.exit(1);
    }
}
