import { join as joinPath, join, posix, resolve as resolvePath } from "path";
import { NPM_CONF_LOCAL_PACKAGES_FOLDER, NPM_CONF_PREFIX, POLICY_DEFINITION_FILENAME, PROJECT_POLICY_CONFIG_FILENAME } from "../constant/index.js";
import { PolicyData, ProjectData } from "../types/index.js";
import { readPolicy } from "./readPolicy.js";
import { readProject } from "./readProject.js";
import { readdirSync, existsSync } from "fs";
import fs from "fs";
import { expectNpmConfigKeyString } from "./getNpmConfig.js";

export function isProject(path: string): boolean {
    return existsSync(join(path, PROJECT_POLICY_CONFIG_FILENAME));
}

export function isPolicy(path: string): boolean {
    return existsSync(join(path, POLICY_DEFINITION_FILENAME));
}

export async function loadPolicies(): Promise<Map<string, PolicyData>> {
    const policies = new Map<string, PolicyData>();
    function readDirToPolicies(dir: string) {
        const projectDirents = readdirSync(dir, { withFileTypes: true });
        for (const dirEntry of projectDirents) {
            const fullPolicyPath = join(dir, dirEntry.name);
            if (dirEntry.isDirectory() && isPolicy(fullPolicyPath)) {
                const policy = readPolicy(fullPolicyPath);
                policies.set(policy.policyName, policy);
            }
        }
    }

    try {
        const globalPackagesPath = resolvePath(await expectNpmConfigKeyString(NPM_CONF_PREFIX), "node_modules");
        readDirToPolicies(globalPackagesPath);
    } catch (e: any) {
        try {
            const globalPackagesPath = resolvePath(await expectNpmConfigKeyString(NPM_CONF_PREFIX), "lib", "node_modules");
            readDirToPolicies(globalPackagesPath);
        } catch (e2: any) {
            console.warn(`CODE00000194 Failed to read globalPackagesPath\n${e.message}`, e, e2);
        }
    }

    try {
        const projectsPath = resolvePath(await expectNpmConfigKeyString(NPM_CONF_LOCAL_PACKAGES_FOLDER));
        readDirToPolicies(projectsPath);
    } catch (e: any) {
        console.warn(`CODE00000195 Failed to read projectsPath\n${e.message}`, e);
    }
    return policies;
}

export function loadProjects(projectsLocation: string, policies: Map<string, PolicyData>): Map<string, ProjectData> {
    const projects = new Map<string, ProjectData>();

    const projectDirents = readdirSync(projectsLocation, { withFileTypes: true });
    for (const dirEntry of projectDirents) {
        const fullDirPath = join(projectsLocation, dirEntry.name);
        if (dirEntry.isDirectory() && isProject(fullDirPath)) {
            projects.set(fullDirPath, readProject(fullDirPath, policies));
        }
    }
    return projects;
}
