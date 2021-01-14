import { dirname } from "path";
import fs from "fs";

type writeFileSyncWithDir = (path: string, content: string, encoding?: BufferEncoding | undefined) => boolean;

export const writeFileSyncWithDir: writeFileSyncWithDir = (path, content, encoding = "utf-8") => {
    try {
        const dir = dirname(path);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path, content, { encoding });
        return true;
    } catch (error) {
        console.error(error.message);
        process.exit(5);
    }
    return true;
};

type removeFileSync = (path: string) => boolean;

export const removeFileSync:removeFileSync=(path)=>{
    try {
        fs.unlinkSync(path);
        return !fs.existsSync(path);
    } catch (error) {
        console.error(error.message);
        process.exit(5);
    }
    return false;
}
