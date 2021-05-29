import { join as joinPath, join, posix } from "path";
import { POLICY_DEFINITION_FILENAME, PROJECT_POLICY_CONFIG_FILENAME } from "../constant";
import { PolicyData, ProjectData } from "../types";
import { readPolicy } from "./readPolicy";
import { readProject } from "./readProject";
import { readdirSync, existsSync } from "fs";
import fs from "fs";

export function isProject(path: string): boolean {
    return existsSync(join(path, PROJECT_POLICY_CONFIG_FILENAME));
}

export function isPolicy(path: string): boolean {
    return existsSync(join(path, POLICY_DEFINITION_FILENAME));
}

export function loadPolicies(policiesLocation: string): Map<string, PolicyData> {
    const policies = new Map<string, PolicyData>();

    let projectDirents = readdirSync(policiesLocation, { withFileTypes: true });
    for (let dirEntry of projectDirents) {
        const fullPolicyPath = join(policiesLocation, dirEntry.name);
        if (dirEntry.isDirectory() && isPolicy(fullPolicyPath)) {
            const policy = readPolicy(fullPolicyPath);
            policies.set(policy.policy.policy, policy);
        }
    }
    return policies;
}

export function loadProjects(projectsLocation: string, policies: Map<string, PolicyData>): Map<string, ProjectData> {
    const projects = new Map<string, ProjectData>();

    let projectDirents = readdirSync(projectsLocation, { withFileTypes: true });
    for (let dirEntry of projectDirents) {
        const fullDirPath = join(projectsLocation, dirEntry.name);
        if (dirEntry.isDirectory() && isProject(fullDirPath)) {
            projects.set(fullDirPath, readProject(fullDirPath, policies));
        }
    }
    return projects;
}
