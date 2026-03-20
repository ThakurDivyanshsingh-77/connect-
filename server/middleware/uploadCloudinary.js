const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the folder based on the route or file type
    let folderName = 'alumni_connect/misc';
    let resourceType = 'auto'; // allow image, video, raw

    if (req.baseUrl.includes('/users')) {
      folderName = 'alumni_connect/profile';
    } else if (req.baseUrl.includes('/events')) {
      folderName = 'alumni_connect/events';
    } else if (req.baseUrl.includes('/certificates')) {
      folderName = 'alumni_connect/certificates';
    } else if (req.baseUrl.includes('/messages')) {
      folderName = 'alumni_connect/messages';
    }

    // Attempt to keep original extension/name but avoid conflicts
    const fileExtension = file.originalname.split('.').pop();
    const originalName = file.originalname.replace(`.${fileExtension}`, '');
    const filename = `${originalName}_${Date.now()}`;

    return {
      folder: folderName,
      public_id: filename,
      resource_type: resourceType,
    };
  },
});

const uploadCloudinary = multer({ storage: storage });

module.exports = uploadCloudinary;
