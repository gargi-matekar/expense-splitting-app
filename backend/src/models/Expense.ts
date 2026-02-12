import mongoose, { Schema, Document } from 'mongoose';

export enum SplitType {
  EQUAL = 'equal',
  PERCENTAGE = 'percentage',
  CUSTOM = 'custom',
}

export interface ISplit {
  user: mongoose.Types.ObjectId;
  amount: number;
  percentage?: number;
}

export interface IExpenseDocument extends Document {
  group: mongoose.Types.ObjectId;
  description: string;
  amount: number;
  paidBy: mongoose.Types.ObjectId;
  splitType: SplitType;
  splits: ISplit[];
  category?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const splitSchema = new Schema<ISplit>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Split amount cannot be negative'],
    },
    percentage: {
      type: Number,
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100'],
    },
  },
  { _id: false }
);

const expenseSchema = new Schema<IExpenseDocument>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [2, 'Description must be at least 2 characters long'],
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Paid by is required'],
      index: true,
    },
    splitType: {
      type: String,
      enum: Object.values(SplitType),
      default: SplitType.EQUAL,
      required: true,
    },
    splits: {
      type: [splitSchema],
      required: [true, 'Splits are required'],
      validate: {
        validator: function (splits: ISplit[]) {
          return splits.length > 0;
        },
        message: 'At least one split is required',
      },
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
expenseSchema.index({ group: 1, date: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ 'splits.user': 1 });

// Validation: Ensure splits total equals expense amount
expenseSchema.pre('save', function (next) {
  const totalSplit = this.splits.reduce((sum, split) => sum + split.amount, 0);
  const roundedTotal = Math.round(totalSplit * 100) / 100;
  const roundedAmount = Math.round(this.amount * 100) / 100;

  if (Math.abs(roundedTotal - roundedAmount) > 0.01) {
    return next(
      new Error(
        `Splits total (${roundedTotal}) must equal expense amount (${roundedAmount})`
      )
    );
  }

  next();
});

const Expense = mongoose.model<IExpenseDocument>('Expense', expenseSchema);

export default Expense;