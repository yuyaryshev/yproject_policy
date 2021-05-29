import { anyJson, boolean, Decoder, object, optional, string } from "@mojotech/json-type-validation";
import {AckPacket, AckPacketDecoders} from "./AckPacket.types";

//----------------------------------------------------------------------------------------------------
export interface CheckProjectApiRequest {
    project: string;
}
export const decoderCheckProjectApiRequest: Decoder<CheckProjectApiRequest> = object({
    project:string(),
    //dataVersionOnly: optional(string()),
});

export interface CheckProjectApiResponse extends AckPacket {
    data: any;
}
export const decoderCheckProjectApiResponse: Decoder<CheckProjectApiResponse> = object({
    ...AckPacketDecoders(),
    data: optional(anyJson()),
});
//----------------------------------------------------------------------------------------------------
