import { checkProject, getLocalModulesPath, isProject, loadPolicies, loadProjects, readProject } from "./helpers";
import { program } from "commander";
import { getCommandOptionAllDescription, getFinishMessage } from "./constant";

export async function run() {
    try {
        program.option("-a --check-all-local-project", getCommandOptionAllDescription());
        program.parse(process.argv);

        const { checkAllLocalProject } = program.opts();
        const localModulesPath = await getLocalModulesPath();
        const currentPath = checkAllLocalProject ? localModulesPath : process.cwd();
        const policies = loadPolicies(localModulesPath);

        if (isProject(currentPath)) {
            await checkProject(policies, readProject(currentPath));
        } else {
            const projects = loadProjects(localModulesPath);
            for (let projectData of projects.values()) {
                await checkProject(policies, projectData);
            }
        }

        console.log(getFinishMessage());
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
