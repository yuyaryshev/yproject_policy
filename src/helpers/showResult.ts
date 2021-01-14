import {PackagesCollection} from "../types";
import chalk from "chalk";

export const showResult = (scan: PackagesCollection) => {
    console.log(chalk.red("Found policies:"));
    scan.policies.forEach(el => console.log(el.policy.policy));
    console.log(chalk.red("Found projects:"));
    scan.projects.forEach(el => console.log(el.location));
}