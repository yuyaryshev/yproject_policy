import { readDirRecursive2 } from "./helpers";
import { join as pathJoin, relative as getRelativePath, dirname } from "path";
import { ReadDirCallback2 } from "src/types";
import { POLICY_DEFINITION_FILENAME } from "./constant";
import { genFilesRegex } from "./helpers/regex";
import fs from "fs";
import { readPolicy } from "./helpers/readPolicy";

const currentPath = pathJoin(process.cwd(), "../../../yproject_policy_projects/git_policy");
const writePath = pathJoin(process.cwd(), "../../../yproject_policy_projects/");

const result = readPolicy(currentPath);

console.log("############################################");
console.log("############################################");
console.log("############################################");

console.log(result);

// for (let [path, content] of result.files.entries()) {
//     let dir = dirname(pathJoin(writePath, path));
//     console.log("PATH: ", dir);
//     if (!fs.existsSync(dirname(pathJoin(writePath, path)))) {
//         console.log("dir not exists", pathJoin(writePath, path));
//         fs.mkdirSync(dirname(pathJoin(writePath, path)), { recursive: true });
//     }
//     fs.writeFileSync(pathJoin(writePath, path), content, {});
// }

process.exit(5);

const policies: Map<string, string> = new Map();
const projects: Map<string, Array<string>> = new Map();

const readProjectsCallback: ReadDirCallback2 = (path, filename, parentResult) => {
    if (filename.isFile()) {
        const fileContent: string = fs.readFileSync(pathJoin(path, filename.name)).toString();
        if (filename.name === POLICY_DEFINITION_FILENAME) {
            const relPath = getRelativePath(currentPath, path);
            if (!policies.has(relPath)) {
                policies.set(relPath, fileContent);
            }
        } else if (filename.name.match(genFilesRegex)) {
            const relPath = getRelativePath(currentPath, path);
            if (!projects.has(relPath)) {
                projects.set(relPath, [fileContent]);
            } else {
                console.log("!!!!");
                const content: Array<string> | any = projects.get(relPath);
                projects.set(relPath, [...content, fileContent]);
            }
        }
    }
    console.log("SKIP___________________________________", filename.name, parentResult);
    return false;
};

readDirRecursive2(currentPath, readProjectsCallback, currentPath);

console.log(policies.entries());
console.log("############################################");
console.log(projects.entries());
