import { body, param } from 'express-validator';

export const createGroupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array')
    .custom((value) => {
      if (value && value.length > 0) {
        return value.every((id: string) => id.match(/^[0-9a-fA-F]{24}$/));
      }
      return true;
    })
    .withMessage('Invalid member IDs'),
];

export const updateGroupValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid group ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

export const addMemberValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid group ID'),
  
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const removeMemberValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid group ID'),
  
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const groupIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid group ID'),
];