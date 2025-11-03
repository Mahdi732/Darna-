import { createRequire } from "module";
const require = createRequire(import.meta.url);
import dotenv from "dotenv";
dotenv.config();

const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET;

class MinioService {
  async upload(fileBuffer, fileName) {
    try {
      await minioClient.putObject(BUCKET, fileName, fileBuffer);
      return `${process.env.MINIO_PUBLIC_URL}/${BUCKET}/${fileName}`;
    } catch (err) {
      console.error("MinIO upload failed:", err.message);
      throw new Error("Erreur lors de lenvoi du fichier vers MinIO");
    }
  }
}

export default new MinioService();
