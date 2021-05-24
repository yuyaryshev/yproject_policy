import {existsSync, outputFileSync, unlinkSync} from "fs-extra";
import {getCreateFileMessage} from "../constant";

export function writeFileSyncWithDir(path: string, content: string, encoding: BufferEncoding | undefined = "utf-8"): boolean {
    outputFileSync(path, content, "utf-8");
    const result = existsSync(path);
    if (result) console.log(getCreateFileMessage(path));
    return result;
}

export function removeFileSync(path: string): boolean {
    unlinkSync(path);
    return !existsSync(path);
}
