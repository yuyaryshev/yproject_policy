import execa from "execa";
import { NPM_CONF_DIFF_EDITOR } from "../constant/index.js";
import chalk from "chalk";

export async function getTextEditorPath(): Promise<string | undefined> {
    const { stdout } = await execa("npm config get", [NPM_CONF_DIFF_EDITOR]);
    return stdout !== "undefined" ? stdout : undefined;
}

export async function openFileDiffFromTextEditor(baseFile: string, currentFilePath: string): Promise<boolean> {
    const editorPath = await getTextEditorPath();
    if (editorPath) {
        console.log("CODE00000283 Running text editor...");
        await execa(editorPath, [baseFile, currentFilePath]);
        return true;
    }
    console.log(chalk.red("CODE00000285 Text editor not found. Please use 'npm config set ${DIFF_EDITOR}' to define projects folder."));
    return false;
}
