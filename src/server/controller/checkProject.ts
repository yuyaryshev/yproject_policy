import { Express } from "express";
import { YPolicyApiServerEnv } from "../Env.js";
import { readFileSync } from "fs";
import { CheckProjectApiResponse, decoderCheckProjectApiRequest, decoderCheckProjectApiResponse } from "../../types/api/CheckProject.types";
import { writeFileSyncIfChanged } from "../../helpers/writeFileSyncIfChanged.js";
// @ts-ignore
import { v4 as newGuid } from "uuid";
import { projectAutofix } from "../../helpers/index.js";
import { ProjectData } from "../../types/index.js";

export function checkProjectPublishApi(env: YPolicyApiServerEnv, app: Express) {
    app.get("/api/one", async function CheckProjectApi(req, res) {
        const requestTs = new Date().toISOString();
        let error: string | undefined = "CODE00000101 Unknown error";

        try {
            const { project } = decoderCheckProjectApiRequest.runWithException(req.query);
            const projectData: ProjectData | undefined = env.projects.get(project);
            if (!(projectData && projectData.policy)) {
                if (!projectData) error = `CODE00000199 Project "${project}" not found!`;
                else error = `CODE00000200 Project "${project}" has no policy specified!`;
            } else {
                const { policy, policyFiles } = projectData;

                const { differentFiles, matchingFiles, projectExtraFiles, policyExtraFiles } = projectAutofix(projectData);

                // TODO implement body of checkProject api - по аналогии с консольной версией
                //      http://localhost:63342/api/file/src/helpers/checkProject.ts:87:1

                // let parsed;
                // try {
                //     const content = readFileSync(dataFilePath, "utf-8");
                //     parsed = JSON.parse(content);
                // } catch (e) {
                //     parsed = undefined;
                // }
                //
                // if (!parsed?.data) {
                //     if (!parsed) parsed = {};
                //     parsed.data = {};
                //     parsed.dataVersion = newGuid();
                //     writeFileSyncIfChanged(dataFilePath, JSON.stringify(parsed, undefined, "    "));
                // }
                // if (parsed && !parsed.data.ts) parsed.data.ts = "2000-01-01 00:00:00";
                //
                // const { data, dataVersion } = parsed;
                //
                // if (env.settings.onGet) await env.settings.onGet({ data, currentDataVersion: dataVersion });

                return res.send(
                    JSON.stringify(
                        decoderCheckProjectApiResponse.runWithException({
                            ok: true,
                        } as CheckProjectApiResponse),
                    ),
                );
            }
            return res.send(
                JSON.stringify(
                    decoderCheckProjectApiResponse.runWithException({
                        ok: false,
                        error,
                    } as CheckProjectApiResponse),
                ),
            );
        } catch (e: any) {
            error = "CODE00000202 " + e.message + "\nat=" + e.at || "" + "\n\n" + e.stack;
            console.error(error);
        }

        return res.send(
            JSON.stringify({
                ok: false,
                error,
            }),
        );
    });
}
