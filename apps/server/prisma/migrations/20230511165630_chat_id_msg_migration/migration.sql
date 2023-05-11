/*
  Warnings:

  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - Added the required column `profileImageUrl` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Message_chatId_key";

-- DropIndex
DROP INDEX "Notification_chatId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "profileImageUrl" TEXT NOT NULL;
