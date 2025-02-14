import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCirclesTable1739444774493 implements MigrationInterface {
  name = "CreateCirclesTable1739444774493";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "circles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "tenantId" integer NOT NULL, "createdBy" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "creatorId" integer, CONSTRAINT "PK_8348b53fdd4f7b6c0b3a6a2f61f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "circles" ADD CONSTRAINT "FK_1579e8b5546569728e749e56096" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "circles" ADD CONSTRAINT "FK_cd9a0bf8c866e6d69e997e4e9ea" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "circles" DROP CONSTRAINT "FK_cd9a0bf8c866e6d69e997e4e9ea"`
    );
    await queryRunner.query(
      `ALTER TABLE "circles" DROP CONSTRAINT "FK_1579e8b5546569728e749e56096"`
    );
    await queryRunner.query(`DROP TABLE "circles"`);
  }
}
