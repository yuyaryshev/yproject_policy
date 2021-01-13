import { join as pathJoin } from "path";
import { readPolicy, readProject, userInteraction, checkPolicy } from "./helpers";

const policyPath = pathJoin(process.cwd(), "../../../yproject_policy_projects/git_policy");
const projectPath = pathJoin(process.cwd(), "../../../yproject_policy_projects/test_project");

userInteraction();
const policy = readPolicy(policyPath);
const project = readProject(projectPath);

console.log("############################################");
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
