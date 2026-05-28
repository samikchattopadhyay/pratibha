import { AwsClient } from "aws4fetch";

// Configure R2 storage client. Region is auto for Cloudflare R2
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint = process.env.R2_ENDPOINT; // e.g. https://<account_id>.r2.cloudflarestorage.com

const r2Client = accessKeyId && secretAccessKey && endpoint
  ? new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: "s3",
      region: "auto",
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

  if (r2Client && endpoint) {
    try {
      const cleanEndpoint = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
      const uploadUrl = `${cleanEndpoint}/${bucketName}/${fileName}`;

      const response = await r2Client.fetch(uploadUrl, {
        method: "PUT",
        body: new Uint8Array(buffer),
        headers: {
          "Content-Type": contentType,
        },
      });

      if (!response.ok) {
        throw new Error(`R2 upload failed with status ${response.status}: ${await response.text()}`);
      }

      const publicUrl = process.env.R2_PUBLIC_URL || "https://pub-certificates.pratibhaparishad.org";
      const cleanPublicUrl = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
      return `${cleanPublicUrl}/${fileName}`;
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

  if (r2Client && endpoint) {
    try {
      const cleanEndpoint = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
      const uploadUrl = `${cleanEndpoint}/${bucketName}/${key}`;

      const response = await r2Client.fetch(uploadUrl, {
        method: "PUT",
        body: new Uint8Array(buffer),
        headers: {
          "Content-Type": contentType,
        },
      });

      if (!response.ok) {
        throw new Error(`R2 banner upload failed with status ${response.status}: ${await response.text()}`);
      }

      const publicUrl = process.env.R2_PUBLIC_URL || "https://pub-certificates.pratibhaparishad.org";
      const cleanPublicUrl = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
      return `${cleanPublicUrl}/${key}`;
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

  if (r2Client && endpoint) {
    try {
      const cleanEndpoint = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
      const uploadUrl = `${cleanEndpoint}/${bucketName}/${key}`;

      const response = await r2Client.fetch(uploadUrl, {
        method: "PUT",
        body: new Uint8Array(buffer),
        headers: {
          "Content-Type": contentType,
        },
      });

      if (!response.ok) {
        throw new Error(`R2 profile photo upload failed with status ${response.status}: ${await response.text()}`);
      }

      const publicUrl = process.env.R2_PUBLIC_URL || "https://pub-certificates.pratibhaparishad.org";
      const cleanPublicUrl = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
      return `${cleanPublicUrl}/${key}`;
    } catch (error) {
      console.error("Cloudflare R2 profile photo upload failed, reverting to local static link:", error);
    }
  } else {
    console.log(`Cloudflare R2 credentials unconfigured. Simulated profile photo save for file: ${fileName}`);
  }

  return `/uploads/profile-photos/${fileName}`;
}
