import execa from "execa";
import { LOCAL_PACKAGES_FOLDER, TEXT_EDITOR } from "../constant";

type getDataFroNpmConfig = () => Promise<string | null>;

export const getLocalModulesPath: getDataFroNpmConfig = async () => {
    const { stdout } = await execa("npm config get", [LOCAL_PACKAGES_FOLDER]);
    return stdout !== "undefined" ? stdout : null;
};

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
        // TODO: выдать сообщение что текстовый редактор не найден
        return false;
    } catch (error) {
        //TODO: вывод сообщения об ошибке
        console.error(error.message);
        return false;
    }
};
