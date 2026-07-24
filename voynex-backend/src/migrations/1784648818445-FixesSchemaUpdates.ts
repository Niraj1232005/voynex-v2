import { MigrationInterface, QueryRunner } from "typeorm";

export class FixesSchemaUpdates1784648818445 implements MigrationInterface {
    name = 'FixesSchemaUpdates1784648818445'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_orders" ADD "razorpayOrderId" character varying`);
        await queryRunner.query(`ALTER TABLE "shop_orders" ADD "razorpayPaymentId" character varying`);
        await queryRunner.query(`ALTER TABLE "shop_orders" ADD "razorpaySignature" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "rentalId" character varying`);
        await queryRunner.query(`ALTER TABLE "shop_orders" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "tripId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "tripId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shop_orders" ALTER COLUMN "status" SET DEFAULT 'paid'`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "rentalId"`);
        await queryRunner.query(`ALTER TABLE "shop_orders" DROP COLUMN "razorpaySignature"`);
        await queryRunner.query(`ALTER TABLE "shop_orders" DROP COLUMN "razorpayPaymentId"`);
        await queryRunner.query(`ALTER TABLE "shop_orders" DROP COLUMN "razorpayOrderId"`);
    }

}
