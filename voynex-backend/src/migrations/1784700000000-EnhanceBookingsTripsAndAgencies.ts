import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceBookingsTripsAndAgencies1784700000000 implements MigrationInterface {
  name = 'EnhanceBookingsTripsAndAgencies1784700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "tripAmount" numeric(10,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "rentalAmount" numeric(10,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "depositAmount" numeric(10,2) NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "rentals" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "itinerarySnapshot" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "coordinates" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "meetingPoint" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "status" character varying NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `UPDATE "organizations" SET "status" = 'approved' WHERE "isApproved" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`ALTER TABLE "trips" DROP COLUMN IF EXISTS "meetingPoint"`);
    await queryRunner.query(`ALTER TABLE "trips" DROP COLUMN IF EXISTS "coordinates"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "itinerarySnapshot"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "rentals"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "depositAmount"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "rentalAmount"`);
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "tripAmount"`);
  }
}
