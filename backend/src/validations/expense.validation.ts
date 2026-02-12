import { body, param, query } from 'express-validator';
import { SplitType } from '../models/Expense';

export const createExpenseValidator = [
  body('groupId')
    .notEmpty()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Invalid group ID'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Description must be between 2 and 200 characters'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('paidBy')
    .notEmpty()
    .withMessage('Paid by is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('splitType')
    .optional()
    .isIn(Object.values(SplitType))
    .withMessage('Invalid split type'),
  
  body('splits')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Splits must be a non-empty array')
    .custom((splits) => {
      return splits.every((split: any) => {
        return (
          split.user &&
          typeof split.user === 'string' &&
          split.user.match(/^[0-9a-fA-F]{24}$/) &&
          typeof split.amount === 'number' &&
          split.amount >= 0
        );
      });
    })
    .withMessage('Invalid split format'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

export const updateExpenseValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid expense ID'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Description must be between 2 and 200 characters'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

export const getExpensesValidator = [
  query('groupId')
    .optional()
    .isMongoId()
    .withMessage('Invalid group ID'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
];

export const expenseIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid expense ID'),
];