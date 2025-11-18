import cloudinary from 'cloudinary';

export const uploadFilesToCloudinary = async (files, folder = "projects") => {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API,
      api_secret: process.env.CLOUDINARY_SECRET,
      secure: true,
    });
  return Promise.all(
    files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              const arr = result.secure_url.split('upload');
              const bucket  = arr[0] + 'upload/f_auto,q_auto:good' + arr[1];
              resolve(bucket);
            }
          }
        ).end(file.buffer);
      });
    })
  );
};

export const deleteFromCloudinary = async (imagesToDelete, folder = "projects") => {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API,
      api_secret: process.env.CLOUDINARY_SECRET,
      secure: true,
    });
  for (const imageUrl of imagesToDelete) {
    const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract public ID from the URL
    try {
      await cloudinary.v2.api
        .delete_resources([folder + '/' + publicId],
          { type: 'upload', resource_type: 'image' })
    } catch (error) {
      console.log(`Failed to delete image ${imageUrl}:`, error.message);
    }
  }
}