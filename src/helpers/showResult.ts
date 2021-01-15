import { PackagesCollection } from "../types";
import chalk from "chalk";

export const showResult = (packagesCollection: PackagesCollection): void => {
    console.log(chalk.red("Found policies:"));
    packagesCollection.policies.forEach((el) => console.log(chalk.green(el.policy.policy)));
    console.log(chalk.red("Found projects:"));
    packagesCollection.projects.forEach((el) => console.log(chalk.green(el.location)));
};
