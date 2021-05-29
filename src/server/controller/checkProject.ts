import { Express } from "express";
import { YPolicyApiServerEnv } from "../Env";
import {readFileSync} from "fs";

export function checkProjectPublishApi(env: YPolicyApiServerEnv, app: Express) {
    app.get("/api/one", async function OneGetApi(req, res) {
        const requestTs = new Date().toISOString();
        let error: string | undefined = "CODE00000101 Unknown error";

        try {
            const { dataVersionOnly } = {
                dataVersionOnly: "0",
                ...decoderOneGetApiRequest.runWithException(req.query || {}),
            };

            let parsed;
            try {
                const content = readFileSync(dataFilePath, "utf-8");
                parsed = JSON.parse(content);
            } catch (e) {
                parsed = undefined;
            }

            if (!parsed?.data) {
                if (!parsed) parsed = {};
                parsed.data = {};
                parsed.dataVersion = newGuid();
                writeFileSyncIfChanged(dataFilePath, JSON.stringify(parsed, undefined, "    "));
            }
            if (parsed && !parsed.data.ts) parsed.data.ts = "2000-01-01 00:00:00";

            const { data, dataVersion } = parsed;

            if (env.settings.onGet) await env.settings.onGet({ data, currentDataVersion: dataVersion });

            return res.send(
                JSON.stringify(
                    decoderOneGetApiResponse.runWithException({
                        ok: true,
                        data: dataVersionOnly === "1" || dataVersionOnly === "true" ? undefined : data,
                        dataVersion,
                    } as OneGetApiResponse)
                )
            );
        } catch (e) {
            error = "CODE00000202 " + e.message + "\nat=" + e.at || "" + "\n\n" + e.stack;
            console.error(error);
        }

        return res.send(
            JSON.stringify({
                ok: false,
                error,
            })
        );
    });

    app.post("/api/one", async function OneSaveApi(req, res) {
        const requestTs = new Date().toISOString();
        let error: string | undefined = "CODE00000104 Unknown error";

        try {
            let parsed;
            let oldContent: string | undefined;
            try {
                const oldContent = readFileSync(dataFilePath, "utf-8");
                parsed = JSON.parse(oldContent);
            } catch (e) {
                parsed = undefined;
            }
            const prevFileContent = {
                data: {},
                dataVersion: newGuid(),
                ...parsed,
            };
            if (!prevFileContent.data.ts) prevFileContent.data.ts = "2000-01-01 00:00:00";

            const oldData = prevFileContent.data;
            const oldDataVersion = prevFileContent.dataVersion;
            const oldTs = prevFileContent.dataTs;

            if (oldContent && oldContent.length && parsed && dateDiff(parsed.data.ts, new Date()) > BACKUP_INTERVAL) {
                // BACKUP old files with specified interval
                const v_backupFileName = backupFileName(parsed.data.ts);
                writeFileSerieSync(backupPath, v_backupFileName, oldContent, MAX_BACKUPS);
            }

            const { data, prevDataVersion, newDataVersion } = decoderOneSaveApiRequest.runWithException(
                req.body.params
            );

            if (env.settings.onPost)
                await env.settings.onPost({
                    data,
                    currentDataVersion: oldDataVersion,
                    prevDataVersion,
                    newDataVersion,
                });
            // if (!data?.tasks?.length) throw new Error(`CODE00000026 Can't save empty task list!`);

            if (!data.ts) data.ts = new Date().toISOString();
            const newFileContent = JSON.stringify({ data, dataVersion: newDataVersion }, undefined, "    ");

            if (!data.ts) data.ts = new Date().toISOString();
            const newDataTs = data.ts;
            const reverseConflict = oldTs >= newDataTs;

            if (oldContent && oldContent.length && oldDataVersion !== prevDataVersion) {
                if (!reverseConflict) {
                    // Backup old data as a conflict missing version
                    const v_conflictFilePath = conflictsFilePath(oldDataVersion);
                    writeFileSyncIfChanged(v_conflictFilePath, oldContent);
                } else {
                    // Backup data which received just now, but it was changed before my recent change as a conflict missing version
                    const v_conflictFilePath = conflictsFilePath(oldDataVersion);
                    writeFileSyncIfChanged(v_conflictFilePath, newFileContent);
                }

                // log conflict into the data
                if (!data.versionConflicts) data.versionConflicts = [];
                data.versionConflicts.push({
                    actualPrev: oldDataVersion,
                    expectedPrev: prevDataVersion,
                    new: newDataVersion,
                    reverseConflict,
                });
            }

            if (!reverseConflict) {
                writeFileSyncIfChanged(dataFilePath, newFileContent);
            }

            return res.send(
                JSON.stringify(
                    decoderOneSaveApiResponse.runWithException({
                        ok: true,
                    } as OneSaveApiResponse)
                )
            );
        } catch (e) {
            error = "CODE00000310 " + e.message;
            console.error(error);
        }

        return res.send(
            JSON.stringify({
                ok: false,
                error,
            })
        );
    });
}
