import {PackagesCollection} from "../types";

export const showResult = (scan: PackagesCollection) => {
    console.log("Found policies:");
    scan.policies.forEach(el => console.log(el.policy.policy));
    console.log("Found projects:");
    scan.projects.forEach(el => console.log(el.location));
}