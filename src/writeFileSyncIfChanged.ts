import { readFileSync, writeFileSync } from "fs";

export const writeFileSyncIfChanged = (fileName: string, content: string, encoding: any = "utf-8") => {
    let current: string | undefined;
    try {
        current = (readFileSync(fileName, encoding) as any) as string;
    } catch (e) {
        if (e.code !== "ENOENT") throw e;
    }

    if (!current || current !== content) {
        writeFileSync(fileName, content, encoding);
        return true;
    }
    return false;
};
