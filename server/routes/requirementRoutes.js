import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  uploadVettingDocs,
  createRequirement,
  getMyRequirements,
  getRequirements,
} from '../controllers/requirementController.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Setup basic local multer
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const upload = multer({ storage });

const router = express.Router();

// Mount everything on /api/requirements base path from server.js
router.post('/vetting-docs', authMiddleware, upload.array('docs', 5), uploadVettingDocs);
router.post('/', authMiddleware, createRequirement);
router.get('/mine', authMiddleware, getMyRequirements);
router.get('/', getRequirements);

export default router;
