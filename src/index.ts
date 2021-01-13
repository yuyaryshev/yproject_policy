import { join as pathJoin } from "path";
import slash from "slash";
import { checkPolicy, readPolicy } from "./helpers";
import { readProject } from "./helpers";

const policyPath = pathJoin(process.cwd(), "../../../yproject_policy_projects/git_policy");
const projectPath = pathJoin(process.cwd(), "../../../yproject_policy_projects/test_project");

const policy = readPolicy(policyPath);

const project = readProject(projectPath);

console.log("############################################");
console.log(projectPath);
console.log(slash(projectPath));
console.log("############################################");
console.log("############################################");

checkPolicy(policy, project);

// console.log(policy);
// console.log(project);

// const execa = require("execa");
//
// (async () => {
//     const {stdout} = await execa("npm config get", ["local_packages_folder2"]);
//     console.log(stdout);
// })();
