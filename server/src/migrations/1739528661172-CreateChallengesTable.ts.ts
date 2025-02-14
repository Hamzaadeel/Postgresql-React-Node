import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateChallengesTable1739528661172 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "challenges",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "title",
            type: "varchar",
          },
          {
            name: "description",
            type: "text",
          },
          {
            name: "circleId",
            type: "int",
          },
          {
            name: "points",
            type: "int",
          },
          {
            name: "createdBy",
            type: "int",
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("challenges");
  }
}
