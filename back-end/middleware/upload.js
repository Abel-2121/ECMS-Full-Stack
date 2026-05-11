const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UPLOAD_TYPES = {
  AVATAR: { dir: 'uploads/avatars', maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] },
  INSTITUTION_LOGO: { dir: 'uploads/institutions', maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] },
  PLATFORM_LOGO: { dir: 'uploads/platform', maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] },
  HERO_IMAGE: { dir: 'uploads/hero', maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] },
  CANDIDATE_PHOTO: { dir: 'uploads/candidates/photos', maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] },
  CANDIDATE_DOCUMENT: { dir: 'uploads/candidates/documents', maxSize: 10 * 1024 * 1024, allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  VOTER_LIST: { dir: 'uploads/voter-lists', maxSize: 5 * 1024 * 1024, allowedTypes: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] },
  ELECTION_BANNER: { dir: 'uploads/elections/banners', maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] }
};

Object.values(UPLOAD_TYPES).forEach(type => {
  if (!fs.existsSync(type.dir)) {
    fs.mkdirSync(type.dir, { recursive: true });
  }
});

const generateFilename = (prefix, file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(file.originalname);
  return `${prefix}-${uniqueSuffix}${ext}`;
};

const createMulterInstance = (uploadType) => {
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

const avatarUpload = createMulterInstance('AVATAR');
const institutionLogoUpload = createMulterInstance('INSTITUTION_LOGO');
const platformLogoUpload = createMulterInstance('PLATFORM_LOGO');
const heroImageUpload = createMulterInstance('HERO_IMAGE');
const candidatePhotoUpload = createMulterInstance('CANDIDATE_PHOTO');
const voterListUpload = createMulterInstance('VOTER_LIST');
const electionBannerUpload = createMulterInstance('ELECTION_BANNER');

const candidateDocumentUpload = () => {
  const config = UPLOAD_TYPES.CANDIDATE_DOCUMENT;
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.dir),
    filename: (req, file, cb) => cb(null, generateFilename('document', file))
  });
  
  return multer({ 
    storage, 
    limits: { fileSize: config.maxSize } 
  });
};

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
  
  UPLOAD_TYPES
};