import { PgColumn } from 'drizzle-orm/pg-core';
import { type TSchema } from '@sinclair/typebox';

export interface IParamsId {
    id: number;
}
export class CombinedFields<
    T extends Record<string, [TSchema, PgColumn]>
> { // typescript sorcery
    constructor(public data: T) { }
    TypeBoxSchema: { [K in keyof T]: T[K][0] } =
        Object.fromEntries(
            Object.entries(this).map(([k, v]) => [k, v[0]])
        ) as any;

    DBView: { [K in keyof typeof this.data]: typeof this.data[K][1] } =
        Object.fromEntries(
            Object.entries(this).map(([k, v]) => [k, v[1]])
        ) as any;
}