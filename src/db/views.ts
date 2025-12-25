import { pgView } from 'drizzle-orm/pg-core';
import { usersTable } from './schema.js';

export const publicUserView = pgView('users').as(qb =>
    qb.select({
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        dateOfBirth: usersTable.dateOfBirth,
        gender: usersTable.gender,
        city: usersTable.city,
        province: usersTable.province,
        bio: usersTable.bio,
        photo: usersTable.photo,
        driverStatus: usersTable.driverStatus,
        ratingOverall: usersTable.ratingOverall,
        createdAt: usersTable.createdAt,
    }).from(usersTable)
);
export const privateUserView = pgView('users').as(qb =>
    qb.select({
        address: usersTable.address,
        postalCode: usersTable.postalCode,
        phone: usersTable.phone,

        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        dateOfBirth: usersTable.dateOfBirth,
        gender: usersTable.gender,
        city: usersTable.city,
        province: usersTable.province,
        bio: usersTable.bio,
        photo: usersTable.photo,
        driverStatus: usersTable.driverStatus,
        ratingOverall: usersTable.ratingOverall,
        createdAt: usersTable.createdAt,
    }).from(usersTable)
);