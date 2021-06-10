import { anyJson, boolean, Decoder, object, optional, string } from "@mojotech/json-type-validation";

export interface AckPacket {
    ok: boolean;
    error?: string;
}

export function AckPacketDecoders() {
    return {
        ok: boolean(),
        error: optional(string()),
    };
}
export const decoderAckPacket: Decoder<AckPacket> = object({
    ...AckPacketDecoders(),
});
