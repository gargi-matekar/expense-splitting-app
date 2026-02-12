import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupDocument extends Document {
  name: string;
  description?: string;
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroupDocument>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      minlength: [2, 'Group name must be at least 2 characters long'],
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
groupSchema.index({ members: 1 });
groupSchema.index({ createdBy: 1 });

// Ensure creator is always a member
groupSchema.pre('save', function (next) {
  if (this.isNew && !this.members.includes(this.createdBy)) {
    this.members.push(this.createdBy);
  }
  next();
});

const Group = mongoose.model<IGroupDocument>('Group', groupSchema);

export default Group;