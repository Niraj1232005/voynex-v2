import { MigrationInterface, QueryRunner } from "typeorm";

export class Phase9FeatureModules1784549562900 implements MigrationInterface {
    name = 'Phase9FeatureModules1784549562900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wishlist_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "itemType" character varying NOT NULL, "itemId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6465d8215330cfec2896106bb2b" UNIQUE ("userId", "itemType", "itemId"), CONSTRAINT "PK_0bd52924a97cda208ed2a07bd69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "category" character varying NOT NULL DEFAULT 'gear', "description" text, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT '100', "rating" double precision NOT NULL DEFAULT '4.8', "images" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shop_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "items" jsonb NOT NULL, "totalAmount" numeric(10,2) NOT NULL, "status" character varying NOT NULL DEFAULT 'paid', "shippingAddress" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_144b24698d178764ea5bb26da3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rentals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "title" character varying NOT NULL, "category" character varying NOT NULL DEFAULT 'gear', "description" text, "pricePerDay" numeric(10,2) NOT NULL, "deposit" numeric(10,2) NOT NULL DEFAULT '0', "images" text, "specs" jsonb, "isAvailable" boolean NOT NULL DEFAULT true, "location" character varying, "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2b10d04c95a8bfe85b506ba52ba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "saved_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "destination" character varying NOT NULL, "durationDays" integer NOT NULL DEFAULT '3', "budget" character varying, "travelers" character varying, "itinerary" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_05c5deee789c57009da2ec77dc6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "rentals" ADD CONSTRAINT "FK_908c145b6b3680c8cb9b17054f5" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rentals" DROP CONSTRAINT "FK_908c145b6b3680c8cb9b17054f5"`);
        await queryRunner.query(`DROP TABLE "saved_plans"`);
        await queryRunner.query(`DROP TABLE "rentals"`);
        await queryRunner.query(`DROP TABLE "shop_orders"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "wishlist_items"`);
    }

}
