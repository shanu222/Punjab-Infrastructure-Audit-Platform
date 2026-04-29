const mongoose = require('mongoose');

const ROLES = ['admin', 'engineer', 'government'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ROLES,
      default: 'engineer',
    },
    department: { type: String, trim: true, default: '' },
    is_active: { type: Boolean, default: true, index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department || '',
    is_active: this.is_active !== false,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
