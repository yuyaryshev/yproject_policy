import execa from "execa";
import { getMissingLocalPackagesError, getMissingTextEditorError, getRunTextEditorMessage, LOCAL_PACKAGES_FOLDER, TEXT_EDITOR } from "../constant";

export async function getLocalModulesPath() {
    const { stdout } = await execa("npm config get", [LOCAL_PACKAGES_FOLDER]);

    if (stdout === "undefined") {
        console.error(getMissingLocalPackagesError());
        process.exit(1);
    }

    return stdout;
}

export async function getTextEditorPath(): Promise<string | undefined> {
    const { stdout } = await execa("npm config get", [TEXT_EDITOR]);
    return stdout !== "undefined" ? stdout : undefined;
}

export async function openFileDiffFromTextEditor(baseFile: string, currentFilePath: string): Promise<boolean> {
    const editorPath = await getTextEditorPath();
    if (editorPath) {
        console.log(getRunTextEditorMessage());
        await execa(editorPath, [baseFile, currentFilePath]);
        return true;
    }
    console.log(getMissingTextEditorError());
    return false;
}
