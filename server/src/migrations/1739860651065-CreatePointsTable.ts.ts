import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePointsTable1739860651065 implements MigrationInterface {
  name = "CreatePointsTable1739860651065";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "challenge_participants" DROP CONSTRAINT "FK_b5616d8d06e51db8b8f520fca6a"`
    );
    await queryRunner.query(
      `CREATE TABLE "points" ("id" SERIAL NOT NULL, "totalPoints" integer NOT NULL, "userId" integer NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57a558e5e1e17668324b165dadf" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "points" ADD CONSTRAINT "FK_b777120b2815c7a2c3e2cb1e350" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participants" ADD CONSTRAINT "FK_646b1ef85e76e552494085ceeca" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "challenge_participants" DROP CONSTRAINT "FK_646b1ef85e76e552494085ceeca"`
    );
    await queryRunner.query(
      `ALTER TABLE "points" DROP CONSTRAINT "FK_b777120b2815c7a2c3e2cb1e350"`
    );
    await queryRunner.query(`DROP TABLE "points"`);
    await queryRunner.query(
      `ALTER TABLE "challenge_participants" ADD CONSTRAINT "FK_b5616d8d06e51db8b8f520fca6a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
