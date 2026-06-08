import { uploadImage } from './cloudinaryUploadService.js';

export async function uploadProductImages({
  productId,
  mainFile,
  additionalFiles = [],
  // kept for signature compatibility; not used for Cloudinary deletion here
  existingMainUrl,
  existingAdditionalUrls = [],
  deleteOldImages = false,
}) {
  if (!productId) throw new Error('Missing productId');

  const hasNewMain = !!mainFile;
  const uploadedAdditional = [];

  // NOTE: Firebase Storage deletion logic is intentionally removed.
  // Cloudinary delete requires secure credentials or a signed request.
  // If you later want deletion, implement server-side or signed Cloudinary calls.
  void existingAdditionalUrls;
  void deleteOldImages;

  // If editing and mainFile not provided, keep the existing main image URL.
  const mainImageUrl = hasNewMain
    ? await uploadImage(mainFile, { folder: `products/${productId}/main` })
    : existingMainUrl;

  if (!mainImageUrl) {
    // Create flow (no existing image) without mainFile.
    throw new Error('Main photo is required (select an image for “Main Image”).');
  }

  for (const file of additionalFiles || []) {
    if (!file) continue;
    const folder = `products/${productId}/additional`;
    const url = await uploadImage(file, { folder });
    uploadedAdditional.push(url);
  }

  return {
    image: mainImageUrl,
    additionalImageUrls: uploadedAdditional,
  };
}





