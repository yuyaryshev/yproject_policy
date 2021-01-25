import globby from "globby";
import { join, posix } from "path";
import { POLICY_DEFINITION_FILENAME, PROJECT_POLICY_CONFIG_FILENAME } from "../constant";
import { PolicyData, ProjectData } from "../types";
import { readDirRecursive } from "./readDirRecursive";
import { readPolicy } from "./readPolicy";
import { readProject } from "./readProject";

export function isProject(path: string): boolean {
    return Boolean(
        globby.sync(PROJECT_POLICY_CONFIG_FILENAME, {
            onlyFiles: true,
            cwd: posix.normalize(path),
        }).length,
    );
}

export function isPolicy(path: string): boolean {
    return Boolean(
        globby.sync(POLICY_DEFINITION_FILENAME, {
            onlyFiles: true,
            cwd: posix.normalize(path),
        }).length,
    );
}

export function loadPolicies(policiesLocation: string): Map<string, PolicyData> {
    const policies = new Map<string, PolicyData>();
    readDirRecursive(policiesLocation, (path, dirEntry) => {
        const fullPolicyPath = join(path, dirEntry.name);
        if (dirEntry.isDirectory() && isPolicy(fullPolicyPath)) {
            const policy = readPolicy(fullPolicyPath);
            policies.set(policy.policy.policy, policy);
            return false;
        }
        return dirEntry.isDirectory();
    });
    return policies;
}

export function loadProjects(dirPath: string): Map<string, ProjectData> {
    const projects = new Map<string, ProjectData>();
    readDirRecursive(dirPath, (path, dirEntry) => {
        const fullDirPath = join(path, dirEntry.name);
        if (dirEntry.isDirectory() && isProject(fullDirPath)) {
            projects.set(fullDirPath, readProject(fullDirPath));
            return false;
        }
        return dirEntry.isDirectory();
    });
    return projects;
}
