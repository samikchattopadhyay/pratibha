import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Configure R2 storage client. Region is auto for Cloudflare R2
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint = process.env.R2_ENDPOINT;

const r2Client = accessKeyId && secretAccessKey && endpoint
  ? new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  : null;

/**
 * Uploads a compiled certificate file (PDF/Image) to Cloudflare R2 bucket.
 * Falls back to a local public path if environment variables are not configured.
 */
export async function uploadCertificate(
  certificateId: string,
  buffer: Buffer,
  contentType = "application/pdf"
): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME || "certificates";
  const fileExtension = contentType === "application/pdf" ? "pdf" : "png";
  const fileName = `${certificateId}.${fileExtension}`;

  if (r2Client) {
    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: contentType,
        })
      );

      const publicUrl = process.env.R2_PUBLIC_URL || "https://pub-certificates.pratibhaparishad.org";
      return `${publicUrl}/${fileName}`;
    } catch (error) {
      console.error("Cloudflare R2 upload action failed, reverting to local static link:", error);
    }
  } else {
    console.log(`Cloudflare R2 credentials unconfigured. Simulated file save for certificate ID: ${certificateId}`);
  }

  // Fallback to local server public static path
  return `/uploads/certificates/${fileName}`;
}

/**
 * Uploads a banner image file to Cloudflare R2 bucket under the banners/ prefix.
 * Falls back to a local public path if environment variables are not configured.
 */
export async function uploadBannerImage(
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME || "certificates";
  const key = `banners/${fileName}`;

  if (r2Client) {
    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
      );

      const publicUrl = process.env.R2_PUBLIC_URL || "https://pub-certificates.pratibhaparishad.org";
      return `${publicUrl}/${key}`;
    } catch (error) {
      console.error("Cloudflare R2 banner upload failed, reverting to local static link:", error);
    }
  } else {
    console.log(`Cloudflare R2 credentials unconfigured. Simulated banner save for file: ${fileName}`);
  }

  return `/uploads/banners/${fileName}`;
}

/**
 * Uploads a student profile photo to Cloudflare R2 bucket under the profile-photos/ prefix.
 * Falls back to a local public path if environment variables are not configured.
 */
export async function uploadProfilePhoto(
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME || "certificates";
  const key = `profile-photos/${fileName}`;

  if (r2Client) {
    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
      );

      const publicUrl = process.env.R2_PUBLIC_URL || "https://pub-certificates.pratibhaparishad.org";
      return `${publicUrl}/${key}`;
    } catch (error) {
      console.error("Cloudflare R2 profile photo upload failed, reverting to local static link:", error);
    }
  } else {
    console.log(`Cloudflare R2 credentials unconfigured. Simulated profile photo save for file: ${fileName}`);
  }

  return `/uploads/profile-photos/${fileName}`;
}
