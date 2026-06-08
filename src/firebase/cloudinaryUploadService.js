const CLOUDINARY_CLOUD_NAME = "dkitfmqer";
const CLOUDINARY_UPLOAD_PRESET = "iwsdecorreactproduct";

function getCloudinaryUploadUrl(resourceType = 'image') {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
}

export async function uploadImage(file, options = {}) {
  if (!file) throw new Error("No file provided for upload");

  const { folder } = options;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  // Preserve existing folder intention in productUploadService
  // (Cloudinary will ignore this if the preset is not configured to allow it).
  if (folder) formData.append("folder", folder);

  const response = await fetch(getCloudinaryUploadUrl('image'), {
    method: "POST",
    body: formData,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `Cloudinary upload failed with status ${response.status}`;
    throw new Error(message);
  }

  const secureUrl = data?.secure_url;
  if (!secureUrl) {
    throw new Error("Cloudinary upload succeeded but secure_url is missing");
  }

  return secureUrl;
}

export async function uploadVideo(file, options = {}) {
  if (!file) throw new Error("No file provided for upload");

  const { folder } = options;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("resource_type", "video");

  if (folder) formData.append("folder", folder);

  const response = await fetch(getCloudinaryUploadUrl('video'), {
    method: "POST",
    body: formData,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `Cloudinary video upload failed with status ${response.status}`;
    throw new Error(message);
  }

  const secureUrl = data?.secure_url;
  if (!secureUrl) {
    throw new Error("Cloudinary video upload succeeded but secure_url is missing");
  }

  return secureUrl;
}


