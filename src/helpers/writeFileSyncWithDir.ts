import { dirname } from "path";
import fs from "fs";
import { getCreateFileMessage } from "../constant";

export function writeFileSyncWithDir(path: string, content: string, encoding: BufferEncoding | undefined = "utf-8"): boolean {
    const dir = dirname(path);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path, content, { encoding });
    const result = fs.existsSync(path);
    if (result) console.log(getCreateFileMessage(path));
    return result;
}

export function removeFileSync(path: string): boolean {
    fs.unlinkSync(path);
    return !fs.existsSync(path);
}
