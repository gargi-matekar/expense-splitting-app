import { Router } from 'express';
import expenseController from '../controllers/expense.controller';
import settlementController from '../controllers/settlement.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createExpenseValidator,
  updateExpenseValidator,
  getExpensesValidator,
  expenseIdValidator,
} from '../validations/expense.validation';
import { groupIdValidator } from '../validations/group.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Private
 */
router.post('/', validate(createExpenseValidator), expenseController.createExpense);

/**
 * @route   GET /api/expenses
 * @desc    Get expenses (with optional filters)
 * @access  Private
 */
router.get('/', validate(getExpensesValidator), expenseController.getGroupExpenses);

/**
 * @route   GET /api/expenses/:id
 * @desc    Get a specific expense by ID
 * @access  Private
 */
router.get('/:id', validate(expenseIdValidator), expenseController.getExpense);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an expense
 * @access  Private (Payer only)
 */
router.put('/:id', validate(updateExpenseValidator), expenseController.updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense
 * @access  Private (Payer or group creator)
 */
router.delete('/:id', validate(expenseIdValidator), expenseController.deleteExpense);

/**
 * @route   GET /api/expenses/settlements/group/:groupId
 * @desc    Get balances and settlements for a group
 * @access  Private
 */
router.get(
  '/settlements/group/:groupId',
  validate(groupIdValidator),
  settlementController.getGroupBalances
);

/**
 * @route   GET /api/expenses/settlements/user
 * @desc    Get overall balance for the current user
 * @access  Private
 */
router.get('/settlements/user', settlementController.getUserBalance);

export default router;