import mongoose from 'mongoose';
import Group, { IGroupDocument } from '../models/Group';
import User from '../models/User';
import ApiError from '../utils/apiError';

export class GroupService {
  async createGroup(
    name: string,
    createdBy: string,
    description?: string,
    memberIds?: string[]
  ): Promise<IGroupDocument> {
    // Validate creator exists
    const creator = await User.findById(createdBy);
    if (!creator) {
      throw ApiError.notFound('Creator user not found');
    }

    // Validate all member IDs if provided
    if (memberIds && memberIds.length > 0) {
      const uniqueMemberIds = [...new Set(memberIds)];
      const members = await User.find({ _id: { $in: uniqueMemberIds } });
      
      if (members.length !== uniqueMemberIds.length) {
        throw ApiError.badRequest('One or more member IDs are invalid');
      }
    }

    // Create group
    const group = await Group.create({
      name,
      description,
      createdBy,
      members: memberIds || [],
    });

    return await group.populate('members', 'name email');
  }

  async getGroupById(groupId: string, userId: string): Promise<IGroupDocument> {
    const group = await Group.findById(groupId)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    // Check if user is a member
    const isMember = group.members.some(
      (member: any) => member._id.toString() === userId
    );

    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    return group;
  }

  async getUserGroups(userId: string): Promise<IGroupDocument[]> {
    const groups = await Group.find({
      members: userId,
    })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    return groups;
  }

  async updateGroup(
    groupId: string,
    userId: string,
    updates: { name?: string; description?: string }
  ): Promise<IGroupDocument> {
    const group = await Group.findById(groupId);

    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    // Only creator can update group details
    if (group.createdBy.toString() !== userId) {
      throw ApiError.forbidden('Only the group creator can update group details');
    }

    if (updates.name) {
      group.name = updates.name;
    }

    if (updates.description !== undefined) {
      group.description = updates.description;
    }

    await group.save();

    return await group.populate('members', 'name email');
  }

  async addMember(
    groupId: string,
    userId: string,
    newMemberId: string
  ): Promise<IGroupDocument> {
    const group = await Group.findById(groupId);

    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    // Check if requesting user is a member
    const isMember = group.members.some(
      (member) => member.toString() === userId
    );

    if (!isMember) {
      throw ApiError.forbidden('You are not a member of this group');
    }

    // Check if new member exists
    const newMember = await User.findById(newMemberId);
    if (!newMember) {
      throw ApiError.notFound('User to add not found');
    }

    // Check if already a member
    const isAlreadyMember = group.members.some(
      (member) => member.toString() === newMemberId
    );

    if (isAlreadyMember) {
      throw ApiError.conflict('User is already a member of this group');
    }

    // Add member
    group.members.push(new mongoose.Types.ObjectId(newMemberId));
    await group.save();

    return await group.populate('members', 'name email');
  }

  async removeMember(
    groupId: string,
    userId: string,
    memberToRemoveId: string
  ): Promise<IGroupDocument> {
    const group = await Group.findById(groupId);

    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    // Only creator can remove members, or users can remove themselves
    const isCreator = group.createdBy.toString() === userId;
    const isSelf = userId === memberToRemoveId;

    if (!isCreator && !isSelf) {
      throw ApiError.forbidden('Only the group creator can remove other members');
    }

    // Cannot remove the creator
    if (group.createdBy.toString() === memberToRemoveId) {
      throw ApiError.badRequest('Cannot remove the group creator');
    }

    // Check if member exists in group
    const memberIndex = group.members.findIndex(
      (member) => member.toString() === memberToRemoveId
    );

    if (memberIndex === -1) {
      throw ApiError.notFound('Member not found in this group');
    }

    // Remove member
    group.members.splice(memberIndex, 1);
    await group.save();

    return await group.populate('members', 'name email');
  }

  async deleteGroup(groupId: string, userId: string): Promise<void> {
    const group = await Group.findById(groupId);

    if (!group) {
      throw ApiError.notFound('Group not found');
    }

    // Only creator can delete group
    if (group.createdBy.toString() !== userId) {
      throw ApiError.forbidden('Only the group creator can delete the group');
    }

    await Group.findByIdAndDelete(groupId);
  }
}

export default new GroupService();