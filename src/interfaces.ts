export enum RecordType {
    TICKER = 0x0,
    NAME = 0x1,
    URI = 0x2,
    PARSABLE = 0x3
}

export type Op = number;
export type OpOrData = Op | Uint8Array;
export type Script = OpOrData[];

const IDENTIFIER  = "SRM0"

export type isGenesis<T extends 0x0 | 0x1 > = T;
export type Type<T extends RecordType.TICKER | RecordType.NAME | RecordType.URI | RecordType.PARSABLE > = T;
export type Position = number;
export type MetaTag = number;


export interface Record {
   identifier: typeof IDENTIFIER;
   type: RecordType;
   meta: MetaTag;
   data: Script;
}

