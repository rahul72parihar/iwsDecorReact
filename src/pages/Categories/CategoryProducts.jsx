import { uploadImage } from "../../firebase/cloudinaryUploadService";

function CategoryProducts() {
  const handleChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);

      console.log("Uploaded URL:", imageUrl);
      alert("Upload Success!");
    } catch (error) {
      console.error(error);
      alert("Upload Failed");
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleChange}
    />
  );
}

export default CategoryProducts;