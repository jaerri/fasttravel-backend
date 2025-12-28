import { Type } from "@sinclair/typebox";
import { vehiclesTable } from "../db/schema.js";
import { CombinedFields } from "./shared.js";

export const vehiclePublicFields = new CombinedFields({
    carName: [Type.String(), vehiclesTable.carName],
    carType: [Type.String(), vehiclesTable.carType],
    carModel: [Type.String(), vehiclesTable.carModel],
    year: [Type.Integer(), vehiclesTable.year],
    color: [Type.String(), vehiclesTable.color],
    plateNumber: [Type.String(), vehiclesTable.plateNumber],
    photo: [Type.String(), vehiclesTable.photo],
    seats: [Type.Integer(), vehiclesTable.seats],
    vehicleFeatures: [Type.Array(Type.String()), vehiclesTable.vehicleFeatures],
});
export const vehiclePrivateFields = new CombinedFields({
    ...vehiclePublicFields.data,

    license: [Type.Integer(), vehiclesTable.license],
    createdAt: [Type.String({ format: "time" }), vehiclesTable.createdAt],
})
