import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubmissionsTable1744282761848 implements MigrationInterface {
  name = "CreateSubmissionsTable1744282761848";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."submissions_status_enum" AS ENUM('Pending', 'Approved', 'Rejected')`
    );
    await queryRunner.query(
      `CREATE TABLE "submissions" ("id" SERIAL NOT NULL, "fileUrl" character varying(255) NOT NULL, "status" "public"."submissions_status_enum" NOT NULL DEFAULT 'Pending', "feedback" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "challengeId" integer, CONSTRAINT "PK_10b3be95b8b2fb1e482e07d706b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" ADD CONSTRAINT "FK_eae888413ab8fc63cc48759d46a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" ADD CONSTRAINT "FK_f42ebcea5910afdeb1b2ad8c83c" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "submissions" DROP CONSTRAINT "FK_f42ebcea5910afdeb1b2ad8c83c"`
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" DROP CONSTRAINT "FK_eae888413ab8fc63cc48759d46a"`
    );
    await queryRunner.query(`DROP TABLE "submissions"`);
    await queryRunner.query(`DROP TYPE "public"."submissions_status_enum"`);
  }
}
