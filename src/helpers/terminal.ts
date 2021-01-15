import execa from "execa";
import { LOCAL_PACKAGES_FOLDER, TEXT_EDITOR } from "../constant";
import chalk from "chalk";

export async function getLocalModulesPath(): Promise<string | null> {
    const { stdout } = await execa("npm config get", [LOCAL_PACKAGES_FOLDER]);
    return stdout !== "undefined" ? stdout : null;
}

type getDataFroNpmConfig = () => Promise<string | null>;
export const getTextEditorPath: getDataFroNpmConfig = async () => {
    const { stdout } = await execa("npm config get", [TEXT_EDITOR]);
    return stdout !== "undefined" ? stdout : null;
};

type openFileDiffFromTextEditor = (baseFile: string, currentFilePath: string) => Promise<boolean>;

export const openFileDiffFromTextEditor: openFileDiffFromTextEditor = async (baseFile, currentFilePath) => {
    try {
        const editorPath = await getTextEditorPath();
        if (editorPath !== null) {
            await execa(editorPath, [baseFile, currentFilePath]);
            return true;
        }
        console.log(chalk.red("Text editor not found"));
        return false;
    } catch (error) {
        console.error(error.message);
        return false;
    }
};
