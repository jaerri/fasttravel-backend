import { PgColumn } from 'drizzle-orm/pg-core';
import { Type, type TNull, type TSchema, type TUnion } from '@sinclair/typebox';

export interface IParamsId {
    id: number;
}

// beware!!!!
// typescript sorcery below

// this type extract information from a PgColumn (drizzle), specifically notNull (which is a type, not value for some reason)
type IsNotNull<C> =
    C extends PgColumn<infer CT, any, any>
    ? CT extends { notNull: infer R }
    ? R
    : never : never

// conditional to give back the a union with null (nullable) for the schema 
// if notNull from the column is false
// else just return the bare schema (which defaults to notNull)
type SchemaDependsOnNullable<
    S extends TSchema,
    Col
> = IsNotNull<Col> extends true
    ? S
    : TUnion<[S, TNull]>;

export class CombinedFields<
    T extends Record<string, [TSchema, PgColumn]>
> {
    DBView = {} as { [K in keyof T]: T[K][1] }
    TypeBoxSchema = {} as { [K in keyof T]: SchemaDependsOnNullable<T[K][0], T[K][1]> };

    // second conditional in constructor to make it real (aka actually wraping it in Type.Union)
    constructor(public data: T) {
        for (const k in data) {
            const v = data[k];
            if (!v) continue;
            const dbCol = v[1], schema = v[0];
            // behold, true typescript magic (no puns intended)
            let isNotNull = true as IsNotNull<typeof dbCol>; // it might appear to be always true
            // but no, it will be false if IsNotNull gives back the type 'false'

            if (isNotNull) {
                this.TypeBoxSchema[k] = schema as SchemaDependsOnNullable<typeof schema, typeof dbCol>;
            } else {
                this.TypeBoxSchema[k] = Type.Union([schema, Type.Null()]);
            }
            this.DBView[k] = dbCol;
        }
    }
}
// i sank oh so many hours into this

        // Object.fromEntries(
        //     Object.entries(this.data).map<[keyof T, T[keyof T][0]]>(([k, v]) => {
        //         const dbCol = v[1];

        //         let val = true as IsNotNull<typeof dbCol>
        //         if (val) {
        //             return [k, v[0]];
        //         } else {
        //             return [k, Type.Union([v[0], Type.Null()])];
        //         }
        //     })
        // );