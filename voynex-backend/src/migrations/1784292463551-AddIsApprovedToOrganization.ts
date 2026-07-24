import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsApprovedToOrganization1784292463551 implements MigrationInterface {
    name = 'AddIsApprovedToOrganization1784292463551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" ADD "isApproved" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "isApproved"`);
    }

}
