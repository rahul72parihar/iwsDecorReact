import { uploadToCloudinary } from './cloudinaryUploadService';

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
  if (!mainFile) throw new Error('Main photo is required');

  const uploadedAdditional = [];

  // NOTE: Firebase Storage deletion logic is intentionally removed.
  // Cloudinary delete requires secure credentials or a signed request.
  // If you later want deletion, implement server-side or signed Cloudinary calls.
  void existingMainUrl;
  void existingAdditionalUrls;
  void deleteOldImages;

  const mainFolder = `products/${productId}/main`;
  const mainImageUrl = await uploadToCloudinary(mainFile, {
    folder: mainFolder,
  });

  for (const file of additionalFiles || []) {
    if (!file) continue;
    const folder = `products/${productId}/additional`;
    const url = await uploadToCloudinary(file, { folder });
    uploadedAdditional.push(url);
  }

  return {
    image: mainImageUrl,
    additionalImageUrls: uploadedAdditional,
  };
}


