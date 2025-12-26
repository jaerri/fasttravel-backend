import { Type } from "@sinclair/typebox";
import { usersTable } from '../db/schema.js';
import { CombinedFields } from "./shared.js";

export const userPublicFields = new CombinedFields({
    firstName: [Type.String(), usersTable.firstName],
    lastName: [Type.String(), usersTable.lastName],
    dateOfBirth: [Type.String({ format: "date" }), usersTable.dateOfBirth],
    gender: [Type.String(), usersTable.gender],
    city: [Type.String(), usersTable.city],
    province: [Type.String(), usersTable.province],
    bio: [Type.String(), usersTable.bio],
    photo: [Type.String(), usersTable.photo],
    driverStatus: [Type.String(), usersTable.driverStatus],
    ratingOverall: [Type.Number(), usersTable.ratingOverall],
    createdAt: [Type.String({ format: "time" }), usersTable.createdAt],
})
export const userPrivateFields = new CombinedFields({
    email: [Type.String(), usersTable.email],
    address: [Type.String(), usersTable.address],
    postalCode: [Type.String(), usersTable.postalCode],
    phone: [Type.Integer(), usersTable.phone],
    ...userPublicFields.data
})