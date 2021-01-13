import { dirname } from "path";
import fs from "fs";

type writeFileSyncWithDir = (path: string, content: string, encoding?: BufferEncoding | undefined) => boolean;

export const writeFileSyncWithDir: writeFileSyncWithDir = (path, content, encoding = "utf-8") => {
    try {
        console.log("TRY TO WRITE FILE: ", path);
        const dir = dirname(path);
        if (!fs.existsSync(dir)) {
            console.log("dir not exists", dir);
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
