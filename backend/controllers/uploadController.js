const AppError = require('../utils/AppError');
const { uploadImage } = require('../services/s3Service');

async function uploadSingle(req, res) {
  if (!req.file) {
    throw new AppError('Expected multipart field "file"', 400);
  }

  const url = await uploadImage(req.file);

  res.status(201).json({
    success: true,
    data: {
      url,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });
}

module.exports = { uploadSingle };
