// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const UPLOAD_TYPES = {
//   AVATAR: { dir: 'uploads/avatars', maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] },
//   INSTITUTION_LOGO: { dir: 'uploads/institutions', maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] },
//   PLATFORM_LOGO: { dir: 'uploads/platform', maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] },
//   HERO_IMAGE: { dir: 'uploads/hero', maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] },
//   CANDIDATE_PHOTO: { dir: 'uploads/candidates/photos', maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] },
//   CANDIDATE_DOCUMENT: { dir: 'uploads/candidates/documents', maxSize: 10 * 1024 * 1024, allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
//   VOTER_LIST: { dir: 'uploads/voter-lists', maxSize: 5 * 1024 * 1024, allowedTypes: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] },
//   ELECTION_BANNER: { dir: 'uploads/elections/banners', maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] }
// };

// Object.values(UPLOAD_TYPES).forEach(type => {
//   if (!fs.existsSync(type.dir)) {
//     fs.mkdirSync(type.dir, { recursive: true });
//   }
// });

// const generateFilename = (prefix, file) => {
//   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//   const ext = path.extname(file.originalname);
//   return `${prefix}-${uniqueSuffix}${ext}`;
// };

// const createMulterInstance = (uploadType) => {
//   const config = UPLOAD_TYPES[uploadType];
  
//   if (!config) {
//     throw new Error(`Invalid upload type: ${uploadType}`);
//   }

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, config.dir);
//     },
//     filename: (req, file, cb) => {
//       const prefix = uploadType.toLowerCase().replace(/_/g, '-');
//       cb(null, generateFilename(prefix, file));
//     }
//   });

//   const fileFilter = (req, file, cb) => {
//     if (config.allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`Invalid file type. Allowed: ${config.allowedTypes.join(', ')}`), false);
//     }
//   };

//   return multer({
//     storage,
//     limits: { fileSize: config.maxSize },
//     fileFilter
//   });
// };

// const avatarUpload = createMulterInstance('AVATAR');
// const institutionLogoUpload = createMulterInstance('INSTITUTION_LOGO');
// const platformLogoUpload = createMulterInstance('PLATFORM_LOGO');
// const heroImageUpload = createMulterInstance('HERO_IMAGE');
// const candidatePhotoUpload = createMulterInstance('CANDIDATE_PHOTO');
// const voterListUpload = createMulterInstance('VOTER_LIST');
// const electionBannerUpload = createMulterInstance('ELECTION_BANNER');

// const candidateDocumentUpload = () => {
//   const config = UPLOAD_TYPES.CANDIDATE_DOCUMENT;
//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, config.dir),
//     filename: (req, file, cb) => cb(null, generateFilename('document', file))
//   });
  
//   return multer({ 
//     storage, 
//     limits: { fileSize: config.maxSize } 
//   });
// };

// module.exports = {
//   uploadAvatar: avatarUpload.single('avatar'),
//   uploadInstitutionLogo: institutionLogoUpload.single('logo'),
//   uploadPlatformLogo: platformLogoUpload.single('logo'),
//   uploadHeroImage: heroImageUpload.single('heroImage'), 
//   uploadCandidatePhoto: candidatePhotoUpload.single('campaignPhoto'),
//   uploadVoterList: voterListUpload.single('voterList'),
//   uploadElectionBanner: electionBannerUpload.single('banner'),
  
//   uploadCandidateDocuments: (fields) => {
//     const upload = candidateDocumentUpload();
//     return upload.fields(fields);
//   },
  
//   UPLOAD_TYPES
// };





// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Determine if we should use local storage (for development)
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true' || !process.env.CLOUDINARY_CLOUD_NAME;

// ==================== DIRECTORY CONFIGURATION (for local storage fallback) ====================
const UPLOAD_TYPES = {
  AVATAR: { dir: 'uploads/avatars', maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'], folder: 'ecms/avatars' },
  INSTITUTION_LOGO: { dir: 'uploads/institutions', maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'], folder: 'ecms/institutions' },
  PLATFORM_LOGO: { dir: 'uploads/platform', maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'], folder: 'ecms/platform' },
  HERO_IMAGE: { dir: 'uploads/hero', maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'], folder: 'ecms/hero' },
  CANDIDATE_PHOTO: { dir: 'uploads/candidates/photos', maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'], folder: 'ecms/candidates' },
  CANDIDATE_DOCUMENT: { dir: 'uploads/candidates/documents', maxSize: 10 * 1024 * 1024, allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], folder: 'ecms/documents' },
  VOTER_LIST: { dir: 'uploads/voter-lists', maxSize: 5 * 1024 * 1024, allowedTypes: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], folder: 'ecms/voter-lists' },
  ELECTION_BANNER: { dir: 'uploads/elections/banners', maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'], folder: 'ecms/banners' }
};

// Create local directories for fallback
if (USE_LOCAL_STORAGE) {
  Object.values(UPLOAD_TYPES).forEach(type => {
    if (!fs.existsSync(type.dir)) {
      fs.mkdirSync(type.dir, { recursive: true });
    }
  });
}

// ==================== GENERATE FILENAME (for local storage) ====================
const generateFilename = (prefix, file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(file.originalname);
  return `${prefix}-${uniqueSuffix}${ext}`;
};

// ==================== CREATE CLOUDINARY STORAGE ====================
const createCloudinaryStorage = (folder, allowedFormats = ['jpg', 'png', 'jpeg', 'webp'], transformations = []) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: allowedFormats,
      transformation: transformations,
      use_filename: true,
      unique_filename: true
    }
  });
};

// ==================== CREATE LOCAL MULTER INSTANCE ====================
const createLocalMulterInstance = (uploadType) => {
  const config = UPLOAD_TYPES[uploadType];
  
  if (!config) {
    throw new Error(`Invalid upload type: ${uploadType}`);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, config.dir);
    },
    filename: (req, file, cb) => {
      const prefix = uploadType.toLowerCase().replace(/_/g, '-');
      cb(null, generateFilename(prefix, file));
    }
  });

  const fileFilter = (req, file, cb) => {
    if (config.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${config.allowedTypes.join(', ')}`), false);
    }
  };

  return multer({
    storage,
    limits: { fileSize: config.maxSize },
    fileFilter
  });
};

// ==================== CREATE CLOUDINARY MULTER INSTANCE ====================
const createCloudinaryMulterInstance = (uploadType) => {
  const config = UPLOAD_TYPES[uploadType];
  
  const storage = createCloudinaryStorage(config.folder, ['jpg', 'png', 'jpeg', 'webp'], [
    { width: 1000, crop: 'limit' }
  ]);

  const fileFilter = (req, file, cb) => {
    if (config.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${config.allowedTypes.join(', ')}`), false);
    }
  };

  return multer({
    storage,
    limits: { fileSize: config.maxSize },
    fileFilter
  });
};

// ==================== CREATE MULTER INSTANCES (Auto-detect cloud or local) ====================
const createMulterInstance = (uploadType) => {
  if (!USE_LOCAL_STORAGE) {
    return createCloudinaryMulterInstance(uploadType);
  }
  return createLocalMulterInstance(uploadType);
};

// ==================== SPECIFIC MULTER INSTANCES ====================
const avatarUpload = createMulterInstance('AVATAR');
const institutionLogoUpload = createMulterInstance('INSTITUTION_LOGO');
const platformLogoUpload = createMulterInstance('PLATFORM_LOGO');
const heroImageUpload = createMulterInstance('HERO_IMAGE');
const candidatePhotoUpload = createMulterInstance('CANDIDATE_PHOTO');
const voterListUpload = createMulterInstance('VOTER_LIST');
const electionBannerUpload = createMulterInstance('ELECTION_BANNER');

// For candidate documents (multiple files) - special handling
const candidateDocumentUpload = () => {
  if (!USE_LOCAL_STORAGE) {
    const storage = createCloudinaryStorage('ecms/documents', ['pdf', 'doc', 'docx'], []);
    return multer({ 
      storage, 
      limits: { fileSize: UPLOAD_TYPES.CANDIDATE_DOCUMENT.maxSize } 
    });
  } else {
    const config = UPLOAD_TYPES.CANDIDATE_DOCUMENT;
    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, config.dir),
      filename: (req, file, cb) => cb(null, generateFilename('document', file))
    });
    
    return multer({ 
      storage, 
      limits: { fileSize: config.maxSize } 
    });
  }
};

// ==================== HELPER FUNCTION TO GET PUBLIC URL ====================
const getPublicUrl = (filePath) => {
  if (!filePath) return null;
  
  // If it's already a Cloudinary URL
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // If using local storage
  if (USE_LOCAL_STORAGE) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:4001';
    return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
  }
  
  return filePath;
};

// ==================== EXPORT MIDDLEWARE ====================
module.exports = {
  uploadAvatar: avatarUpload.single('avatar'),
  uploadInstitutionLogo: institutionLogoUpload.single('logo'),
  uploadPlatformLogo: platformLogoUpload.single('logo'),
  uploadHeroImage: heroImageUpload.single('heroImage'),
  uploadCandidatePhoto: candidatePhotoUpload.single('campaignPhoto'),
  uploadVoterList: voterListUpload.single('voterList'),
  uploadElectionBanner: electionBannerUpload.single('banner'),
  
  uploadCandidateDocuments: (fields) => {
    const upload = candidateDocumentUpload();
    return upload.fields(fields);
  },
  
  getPublicUrl,
  UPLOAD_TYPES,
  USE_LOCAL_STORAGE
};