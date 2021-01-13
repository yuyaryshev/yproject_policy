// import { readDirRecursive2 } from "./helpers";
import { join as pathJoin } from "path";
import { POLICY_DEFINITION_FILENAME } from "./constant";
// import { ReadDirCallback2 } from "src/types";
// import { POLICY_DEFINITION_FILENAME } from "./constant";
// import { genFilesRegex } from "./helpers/regex";
// import fs from "fs";
import { readPolicy, readProject, userInteraction } from "./helpers";


const currentPath = pathJoin(process.cwd(), "/../yproject_policy_projects/test_project");
// const writePath = pathJoin(process.cwd(), "/../yproject_policy_projects/");
//
const result = readProject(currentPath);
//const result = readPolicy(currentPath);
userInteraction()

console.log("############################################");
console.log("############################################");
console.log("############################################");

// const execa = require("execa");
//
// (async () => {
//     const {stdout} = await execa("npm config get", ["local_packages_folder2"]);
//     console.log(stdout);
// })();

//console.log(result);

// for (let [path, content] of result.files.entries()) {
//     let dir = dirname(pathJoin(writePath, path));
//     console.log("PATH: ", dir);
//     if (!fs.existsSync(dirname(pathJoin(writePath, path)))) {
//         console.log("dir not exists", pathJoin(writePath, path));
//         fs.mkdirSync(dirname(pathJoin(writePath, path)), { recursive: true });
//     }
//     fs.writeFileSync(pathJoin(writePath, path), content, {});
// }
