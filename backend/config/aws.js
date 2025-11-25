// config/aws.js
import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadToS3 = async (buffer, key, mimeType) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: "public-read",
  };

  const data = await s3.upload(params).promise();
  return data.Location; // public URL
};

export { s3, uploadToS3 };
