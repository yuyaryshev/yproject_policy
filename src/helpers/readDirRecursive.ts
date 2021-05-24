import { Dirent, readdirSync } from "fs";
import { join } from "path";

export type ReadDirCallback = (path: string, dirEntry: Dirent) => true | false | undefined | void;

export function readDirRecursive(path: string, v_callback: ReadDirCallback): void {
    let files = readdirSync(path, { withFileTypes: true });
    for (let file of files) {
        let r = v_callback(path, file);
        if (r !== false && file.isDirectory()) readDirRecursive(join(path, file.name), v_callback);
    }
}
