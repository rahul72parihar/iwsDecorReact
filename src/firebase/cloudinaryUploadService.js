// Cloudinary unsigned/signed upload helper.
// Uses frontend-friendly unsigned upload unless you provide a signed config.

export async function uploadToCloudinary(file, { folder = 'products' } = {}) {
  if (!file) throw new Error('No file provided');

  // Prefer individual env vars.
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Fallback to CLOUDINARY_URL if available (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL || import.meta.env.CLOUDINARY_URL;

  // If cloudName/uploadPreset are missing, we try to derive cloudName from CLOUDINARY_URL.
  let derivedCloudName = cloudName;
  if (!derivedCloudName && cloudinaryUrl) {
    // cloudinary://{apiKey}:{apiSecret}@{cloudName}
    const atIdx = cloudinaryUrl.lastIndexOf('@');
    if (atIdx !== -1) derivedCloudName = cloudinaryUrl.slice(atIdx + 1);
  }

  if (!derivedCloudName) {
    throw new Error(
      'Missing Cloudinary configuration. Set VITE_CLOUDINARY_CLOUD_NAME in .env (or VITE_CLOUDINARY_URL).'
    );
  }

  // Unsigned upload requires upload preset.
  if (!uploadPreset) {
    throw new Error(
      'Missing Cloudinary unsigned upload preset. Set VITE_CLOUDINARY_UPLOAD_PRESET in .env.'
    );
  }

  const url = `https://api.cloudinary.com/v1_1/${derivedCloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (folder) formData.append('folder', folder);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data?.secure_url) {
    throw new Error('Cloudinary upload succeeded but secure_url is missing in response.');
  }

  return data.secure_url;
}

