import fs from "fs";
import { join as joinPath } from "path";
import { ReadDirCallback } from "../types";

export const readDirRecursive = (path: string, v_callback: ReadDirCallback): void => {
    let files = fs.readdirSync(path, { withFileTypes: true });
    for (let file of files) {
        let r = v_callback(path, file);
        if (r !== false && file.isDirectory()) readDirRecursive(joinPath(path, file.name), v_callback);
    }
};
