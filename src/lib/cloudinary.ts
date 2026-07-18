import { v2 as cloudinary } from "cloudinary";

// Configures from CLOUDINARY_URL if present, else from the three discrete vars.
// All story images are uploaded as `type: authenticated` (private) and served
// via signed delivery URLs — the Cloudinary equivalent of Supabase signed URLs.
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// public_id layout mirrors the old bucket layout, under a top-level folder:
//   telltales/users/{parentId}/stories/{storyId}/chapter-{i}
export function storyImagePublicId(parentId: string, storyId: string, chapterIndex: number) {
  return `telltales/users/${parentId}/stories/${storyId}/chapter-${chapterIndex}`;
}

export async function uploadStoryImage(publicId: string, bytes: Uint8Array): Promise<string> {
  const b64 = Buffer.from(bytes).toString("base64");
  // Under Cloudinary dynamic-folders mode, slashes in `public_id` do NOT place
  // the asset in a folder — `asset_folder` controls Media Library placement.
  // Derive it from the publicId path (everything before the final segment).
  const assetFolder = publicId.includes("/") ? publicId.slice(0, publicId.lastIndexOf("/")) : undefined;
  const res = await cloudinary.uploader.upload(`data:image/png;base64,${b64}`, {
    public_id: publicId,
    asset_folder: assetFolder,
    resource_type: "image",
    type: "authenticated",
    overwrite: true,
  });
  return res.public_id;
}

// Signed delivery URL for a private (authenticated) image.
export function signedImageUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: "image",
    type: "authenticated",
    sign_url: true,
    secure: true,
  });
}

export async function deleteStoryImages(publicIds: string[]): Promise<void> {
  if (!publicIds.length) return;
  await cloudinary.api.delete_resources(publicIds, { resource_type: "image", type: "authenticated" });
}

export async function deleteUserImages(userId: string): Promise<void> {
  await cloudinary.api.delete_resources_by_prefix(`telltales/users/${userId}`, {
    resource_type: "image",
    type: "authenticated",
  });
}

export { cloudinary };
