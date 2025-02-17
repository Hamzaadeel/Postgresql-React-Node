import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCircleParticipantsTable1739784389725
  implements MigrationInterface
{
  name = "CreateCircleParticipantsTable1739784389725";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "circle_participants" ("id" SERIAL NOT NULL, "userId" integer, "circleId" integer, CONSTRAINT "PK_365962761671a72ae32954847b0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "challenges" ALTER COLUMN "createdAt" SET DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "circles" ADD CONSTRAINT "FK_1088465c8604b90e01249c90edb" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "circle_participants" ADD CONSTRAINT "FK_167f34d75e571af6935e257e807" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "circle_participants" ADD CONSTRAINT "FK_fe2ba0ad92c101629011a9073a6" FOREIGN KEY ("circleId") REFERENCES "circles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "challenges" ADD CONSTRAINT "FK_b636f37e797d98f824787c9b0a9" FOREIGN KEY ("circleId") REFERENCES "circles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "challenges" ADD CONSTRAINT "FK_372740a1d41ea6630732d7b8cce" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "challenges" DROP CONSTRAINT "FK_372740a1d41ea6630732d7b8cce"`
    );
    await queryRunner.query(
      `ALTER TABLE "challenges" DROP CONSTRAINT "FK_b636f37e797d98f824787c9b0a9"`
    );
    await queryRunner.query(
      `ALTER TABLE "circle_participants" DROP CONSTRAINT "FK_fe2ba0ad92c101629011a9073a6"`
    );
    await queryRunner.query(
      `ALTER TABLE "circle_participants" DROP CONSTRAINT "FK_167f34d75e571af6935e257e807"`
    );
    await queryRunner.query(
      `ALTER TABLE "circles" DROP CONSTRAINT "FK_1088465c8604b90e01249c90edb"`
    );
    await queryRunner.query(
      `ALTER TABLE "challenges" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`
    );
    await queryRunner.query(`DROP TABLE "circle_participants"`);
  }
}
