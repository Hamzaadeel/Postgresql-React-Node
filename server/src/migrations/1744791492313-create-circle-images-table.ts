import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCircleImagesTable1744791492313
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "circle_images",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "circleId",
            type: "int",
          },
          {
            name: "image_path",
            type: "text",
          },
        ],
        foreignKeys: [
          {
            columnNames: ["circleId"],
            referencedTableName: "circles",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("circle_images");
  }
}
