const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { validateBody } = require('../middleware/validate');
const {
  adminUserCreateSchema,
  adminUserUpdateSchema,
} = require('../validators/schemas');
const { listUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.use(protect, requireRoles('admin'));

router.get('/', asyncHandler(listUsers));
router.post('/', validateBody(adminUserCreateSchema), asyncHandler(createUser));
router.put('/:id', validateBody(adminUserUpdateSchema), asyncHandler(updateUser));
router.delete('/:id', asyncHandler(deleteUser));

module.exports = router;
