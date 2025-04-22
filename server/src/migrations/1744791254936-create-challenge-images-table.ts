import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateChallengeImagesTable1623456789013
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "challenge_images",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "challengeId",
            type: "int",
          },
          {
            name: "image_path",
            type: "text",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["challengeId"],
            referencedTableName: "challenges",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("challenge_images");
  }
}
