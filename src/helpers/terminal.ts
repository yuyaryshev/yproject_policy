import execa from "execa";
import { LOCAL_PACKAGES_FOLDER, TEXT_EDITOR } from "../constant";
import chalk from "chalk";

export async function getLocalModulesPath(): Promise<string | undefined> {
    const { stdout } = await execa("npm config get", [LOCAL_PACKAGES_FOLDER]);
    return stdout !== "undefined" ? stdout : undefined;
}

export async function getTextEditorPath(): Promise<string | undefined> {
    const { stdout } = await execa("npm config get", [TEXT_EDITOR]);
    return stdout !== "undefined" ? stdout : undefined;
}

export async function openFileDiffFromTextEditor(baseFile: string, currentFilePath: string): Promise<boolean> {
    const editorPath = await getTextEditorPath();
    if (editorPath) {
        await execa(editorPath, [baseFile, currentFilePath]);
        return true;
    }
    console.log(chalk.red("Text editor not found"));
    return false;
}
