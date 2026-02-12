import { Router } from 'express';
import groupController from '../controllers/group.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createGroupValidator,
  updateGroupValidator,
  addMemberValidator,
  removeMemberValidator,
  groupIdValidator,
} from '../validations/group.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private
 */
router.post('/', validate(createGroupValidator), groupController.createGroup);

/**
 * @route   GET /api/groups
 * @desc    Get all groups for the current user
 * @access  Private
 */
router.get('/', groupController.getUserGroups);

/**
 * @route   GET /api/groups/:id
 * @desc    Get a specific group by ID
 * @access  Private
 */
router.get('/:id', validate(groupIdValidator), groupController.getGroup);

/**
 * @route   PUT /api/groups/:id
 * @desc    Update a group
 * @access  Private (Creator only)
 */
router.put('/:id', validate(updateGroupValidator), groupController.updateGroup);

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete a group
 * @access  Private (Creator only)
 */
router.delete('/:id', validate(groupIdValidator), groupController.deleteGroup);

/**
 * @route   POST /api/groups/:id/members
 * @desc    Add a member to a group
 * @access  Private (Members can add)
 */
router.post('/:id/members', validate(addMemberValidator), groupController.addMember);

/**
 * @route   DELETE /api/groups/:id/members/:userId
 * @desc    Remove a member from a group
 * @access  Private (Creator or self)
 */
router.delete(
  '/:id/members/:userId',
  validate(removeMemberValidator),
  groupController.removeMember
);

export default router;