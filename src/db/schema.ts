import { pgEnum, timestamp, integer, pgTable, text, date } from "drizzle-orm/pg-core";

export const driverStatusEnum = pgEnum('driver_status', ['active', 'suspended', 'pending', 'false']);

export const usersTable = pgTable('users', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    passwordHash: text().notNull(),
    email: text().notNull().unique(),

    firstName: text().notNull(),
    lastName: text().notNull(),
    dateOfBirth: date(),
    gender: text(),
    phone: integer(),
    address: text(),
    city: text(),
    province: text(),
    postalCode: text(),
    bio: text(),
    photo: text(),
    driverStatus: text(),
    ratingOverall: integer(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
});
export const vehiclesTable = pgTable('vehicles', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    ownerId: integer().references(() => usersTable.id).notNull(), // foreign key to users.id
    carName: text(),
    carType: text(),
    carModel: text(),
    year: integer(),
    color: text(),
    plateNumber: text(),
    license: integer(),
    photo: text(),
    seats: integer(),
    vehicleFeatures: text().array()
});
