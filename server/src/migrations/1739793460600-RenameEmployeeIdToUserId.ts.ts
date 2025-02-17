import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameEmployeeIdToUserId1739793460600
  implements MigrationInterface
{
  name = "RenameEmployeeIdToUserId1739793460600";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "challenge_participants" RENAME COLUMN "employeeId" TO "userId"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "challenge_participants" RENAME COLUMN "userId" TO "employeeId"
    `);
  }
}
