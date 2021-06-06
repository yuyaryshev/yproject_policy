import { resolve, join, posix } from "path";
import { readFileSync } from "fs";
import { PolicyData, PolicyDefinition, PolicyOptions, ProjectData, ProjectPolicyConfig } from "src/types";
import { dirFilesOnly, exceptPolicy, filterFiles, mergeGlobs } from "../helpers";
import { genFileFilter, PACKAGE_JSON, PROJECT_POLICY_CONFIG_FILENAME, PROJECT_POLICY_PREV_CONTENT_FILENAME } from "../constant";
import { FileMap } from "../types/FileMap";
import { FilterCollection } from "../types/other";

function genPolicyFiles({
    projectDir,
    policy,
    packageJson,
    policyConf,
    projectFiles,
}: {
    projectDir: string;
    policy: PolicyData;
    packageJson: any;
    policyConf: ProjectPolicyConfig;
    projectFiles: FileMap;
}): FileMap {
    // Generating policy files - start
    const policyGeneratedFiles = new Map();

    for (let [relPath, { generate, filename }] of policy.genFiles.entries()) {
        const filename2 =
            typeof filename === "string"
                ? filename
                : typeof filename === "function"
                ? filename(packageJson ?? {}, policyConf?.options ?? {})
                : relPath.replace(/\.gen\.cjs$/, "");
        const finalFilename = resolve(projectDir, filename2);
        const content = generate(
            packageJson ?? {},
            policyConf?.options ?? {},
            projectFiles.get(filename2) || "",
            //readFileSync(finalFilename, "utf-8") || "",
        );
        policy.files.delete(filename2);
        policyGeneratedFiles.set(filename2, content);
    }

    const policyFiles0: FileMap = new Map([...policy.files, ...policyGeneratedFiles]);
    const policyFiles: FileMap = new Map();
    const policyFileNames = filterFiles([...policyFiles0.keys()], "**", mergeGlobs(policyConf.options?.exclude));
    for (const filename of policyFileNames) policyFiles.set(filename, policyFiles0.get(filename)!);
    return policyFiles;
}

export function readProject(projectDir: string, policies: Map<string, PolicyData>): ProjectData {
    const projectPolicyConfig: ProjectPolicyConfig = require(join(projectDir, PROJECT_POLICY_CONFIG_FILENAME));
    const policy = exceptPolicy(policies, projectPolicyConfig.policy, projectDir);
    const excludeFilters: FilterCollection = mergeGlobs(projectPolicyConfig?.options?.exclude, policy?.options?.exclude);

    const files: FileMap = new Map();
    const fileNames = filterFiles(dirFilesOnly(projectDir), "**", excludeFilters);
    for (let relPath of fileNames) files.set(relPath, readFileSync(join(projectDir, relPath)).toString());
    const packageJson: any = require(join(projectDir, PACKAGE_JSON));
    let prevContentJson: any;
    try {
        prevContentJson = require(join(projectDir, PROJECT_POLICY_PREV_CONTENT_FILENAME));
    } catch (e) {
        prevContentJson = {};
    }
    const prevPolicyFiles: Set<string> = new Set();
    const policyFiles: FileMap = genPolicyFiles({ projectDir, policy, packageJson, policyConf: projectPolicyConfig, projectFiles: files });

    for (let [fileName, fileContent] of files) if (prevContentJson[fileName] === fileContent) prevPolicyFiles.add(fileName);
    return {
        policyConf: projectPolicyConfig,
        projectFiles: files,
        packageJson,
        projectDir,
        prevPolicyFiles,
        policy,
        policyFiles,
    };
}
