import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfilePicturePathToUsers1744614157994 implements MigrationInterface {
    name = 'AddProfilePicturePathToUsers1744614157994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "profile_picture_path" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_picture_path"`);
    }

}
