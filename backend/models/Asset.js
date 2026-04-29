const mongoose = require('mongoose');

const ASSET_TYPES = [
  'building',
  'road',
  'bridge',
  'dam',
  'canal',
  'power',
  'water_supply',
  'other',
];

const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const assetSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ASSET_TYPES, required: true },
    location: { type: locationSchema, required: true },
    district: { type: String, required: true, trim: true, index: true },
    construction_year: { type: Number, min: 1800, max: 2100 },
    material: { type: String, trim: true },
    structural_type: { type: String, trim: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('Asset', assetSchema);
module.exports.ASSET_TYPES = ASSET_TYPES;
