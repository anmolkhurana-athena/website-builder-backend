/*
  Warnings:

  - The values [STUDENT,INSTITUTION_ADMIN,SUPER_ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE] on the enum `WebsiteStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `institution_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `institution_id` on the `websites` table. All the data in the column will be lost.
  - You are about to drop the column `subdomain` on the `websites` table. All the data in the column will be lost.
  - You are about to drop the `institutions` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WebsiteStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'DELETED');
ALTER TABLE "public"."websites" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "websites" ALTER COLUMN "status" TYPE "WebsiteStatus_new" USING ("status"::text::"WebsiteStatus_new");
ALTER TYPE "WebsiteStatus" RENAME TO "WebsiteStatus_old";
ALTER TYPE "WebsiteStatus_new" RENAME TO "WebsiteStatus";
DROP TYPE "public"."WebsiteStatus_old";
ALTER TABLE "websites" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "websites" DROP CONSTRAINT "websites_institution_id_fkey";

-- DropForeignKey
ALTER TABLE "websites" DROP CONSTRAINT "websites_settings_id_fkey";

-- DropIndex
DROP INDEX "users_institution_id_idx";

-- DropIndex
DROP INDEX "users_role_idx";

-- DropIndex
DROP INDEX "websites_institution_id_idx";

-- DropIndex
DROP INDEX "websites_subdomain_idx";

-- DropIndex
DROP INDEX "websites_subdomain_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "institution_id",
DROP COLUMN "isApproved",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastPasswordChangeAt" TIMESTAMP(3),
ALTER COLUMN "role" SET DEFAULT 'USER';

-- AlterTable
ALTER TABLE "websites" DROP COLUMN "institution_id",
DROP COLUMN "subdomain",
ADD COLUMN     "currentDraftVersionId" TEXT,
ADD COLUMN     "currentPublishedVersionId" TEXT,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "thumbnail_url" TEXT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "institutions";

-- DropEnum
DROP TYPE "InstitutionStatus";

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "replacedBy" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "websites_deleted_at_idx" ON "websites"("deleted_at");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_id_fkey" FOREIGN KEY ("id") REFERENCES "websites"("settings_id") ON DELETE CASCADE ON UPDATE CASCADE;
