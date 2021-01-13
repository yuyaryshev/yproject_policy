import fs from "fs";
import { join as joinPath } from "path";
import { ReadDirCallback, ReadDirCallback2 } from "../types";

export const readDirRecursive = (path: string, v_callback: ReadDirCallback) => {
    let files = fs.readdirSync(path, { withFileTypes: true });
    for (let file of files) {
        let r = v_callback(path, file);
        if (r !== false && file.isDirectory()) readDirRecursive(joinPath(path, file.name), v_callback);
    }
};

export const readDirRecursive2 = (path: string, v_callback: ReadDirCallback2, parentResult?: any | undefined) => {
    let files = fs.readdirSync(path, { withFileTypes: true });
    for (let filename of files) {
        let r = v_callback(path, filename, parentResult);
        if (r !== false && filename.isDirectory()) readDirRecursive2(joinPath(path, filename.name), v_callback, r);
    }
};
