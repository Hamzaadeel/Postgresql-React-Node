import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChallengeParticipantsTable1739790307294
  implements MigrationInterface
{
  name = "CreateChallengeParticipantsTable1739790307294";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."challenge_participants_status_enum" AS ENUM('Pending', 'Completed')`
    );
    await queryRunner.query(
      `CREATE TABLE "challenge_participants" ("id" SERIAL NOT NULL, "status" "public"."challenge_participants_status_enum" NOT NULL DEFAULT 'Pending', "earnedPoints" integer NOT NULL DEFAULT '0', "employeeId" integer, "challengeId" integer, CONSTRAINT "PK_55c94761cd25911bda9bb2ef9b7" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participants" ADD CONSTRAINT "FK_b5616d8d06e51db8b8f520fca6a" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participants" ADD CONSTRAINT "FK_1b90cb02d845ee4d21273f160ea" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "challenge_participants" DROP CONSTRAINT "FK_1b90cb02d845ee4d21273f160ea"`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_participants" DROP CONSTRAINT "FK_b5616d8d06e51db8b8f520fca6a"`
    );
    await queryRunner.query(`DROP TABLE "challenge_participants"`);
    await queryRunner.query(
      `DROP TYPE "public"."challenge_participants_status_enum"`
    );
  }
}
