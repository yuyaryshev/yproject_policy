import execa from "execa";
import { LOCAL_PACKAGES_FOLDER, DIFF_EDITOR } from "../constant";
import chalk from "chalk";

export async function getLocalModulesPath() {
    const { stdout } = await execa("npm config get", [LOCAL_PACKAGES_FOLDER]);

    if (stdout === "undefined") {
        console.error(chalk.red(`CODE00000284 Please use 'npm config set ${LOCAL_PACKAGES_FOLDER}' to define projects folder.`));
        process.exit(1);
    }

    return stdout;
}

export async function getTextEditorPath(): Promise<string | undefined> {
    const { stdout } = await execa("npm config get", [DIFF_EDITOR]);
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
