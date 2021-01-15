import { PackagesCollection } from "../types";

export function checkMissingPolicies(packagesCollection: PackagesCollection): Map<string, string> {
    const result: Map<string, string> = new Map();
    for (let [path, project] of packagesCollection.projects.entries()) {
        if (!packagesCollection.policies.has(project.policyConf.policy)) result.set(path, project.policyConf.policy);
    }
    return result;
}
