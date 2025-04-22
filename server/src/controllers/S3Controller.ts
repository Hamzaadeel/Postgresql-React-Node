import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

class S3Controller {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || "";
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME || "";
  }

  // Generate a pre-signed URL for file upload
  async getUploadUrl(req: Request, res: Response) {
    try {
      const { fileName, fileType, type = "submissions" } = req.body;

      if (!fileName || !fileType) {
        return res
          .status(400)
          .json({ error: "fileName and fileType are required" });
      }

      const allowedFileTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedFileTypes.includes(fileType)) {
        return res.status(400).json({
          error:
            "Invalid file type. Allowed types: JPG, PNG, PDF, DOC, DOCX, TXT",
        });
      }

      // Generate a key with appropriate folder prefix based on type
      let folderPrefix;
      if (type === "profile") {
        folderPrefix = "profile";
      } else if (type === "circle") {
        folderPrefix = "circle";
      } else if (type === "challenge") {
        folderPrefix = "challenge";
      } else {
        folderPrefix = "submissions";
      }

      const key = `${folderPrefix}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      res.json({
        uploadUrl,
        key,
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  }

  // Generate a pre-signed URL for file viewing
  async getViewUrl(req: Request, res: Response) {
    try {
      const { key } = req.query;

      if (!key || typeof key !== "string") {
        return res.status(400).json({ error: "File key is required" });
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const viewUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // URL expires in 1 hour
      });

      res.json({
        viewUrl,
      });
    } catch (error) {
      console.error("Error generating view URL:", error);
      res.status(500).json({ error: "Failed to generate view URL" });
    }
  }

  // Generate a permanent URL for file download
  async getDownloadUrl(req: Request, res: Response) {
    try {
      const { fileName } = req.params;

      if (!fileName) {
        return res.status(400).json({ error: "fileName is required" });
      }

      // Construct a permanent S3 URL
      const downloadUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;

      res.json({
        downloadUrl,
        fileName,
      });
    } catch (error) {
      console.error("Error generating download URL:", error);
      res.status(500).json({ error: "Failed to generate download URL" });
    }
  }

  // Delete a file from S3
  async deleteFile(req: Request, res: Response) {
    try {
      let { fileName } = req.params;
      const { type = "submissions" } = req.query;

      console.log(
        `Delete file request received for: ${fileName}, type: ${type}`
      );

      if (!fileName) {
        return res.status(400).json({ error: "fileName is required" });
      }

      // URL decode the fileName in case it was encoded
      fileName = decodeURIComponent(fileName);

      let key = fileName;

      // If the fileName already contains a folder prefix like "profile/file.jpg", use it directly
      if (!fileName.includes("/")) {
        // If not, add the folder prefix based on type
        let folderPrefix;
        if (type === "profile") {
          folderPrefix = "profile";
        } else if (type === "circle") {
          folderPrefix = "circle";
        } else if (type === "challenge") {
          folderPrefix = "challenge";
        } else {
          folderPrefix = "submissions";
        }
        key = `${folderPrefix}/${fileName}`;
      }

      console.log(`Attempting to delete file with key: ${key}`);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);

      res.json({
        message: "File deleted successfully",
        fileName,
        key,
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      res
        .status(500)
        .json({ error: "Failed to delete file", details: error.message });
    }
  }
}

export default new S3Controller();
