// src/hooks/useTags.ts
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {
  fetchTags,
  addTag,
  deleteTag,
  mergeTags,
  updateTagCount,
  type Tag
} from '@/store/tagSlice';

export const useTags = () => {
  const dispatch = useAppDispatch();
  const { tags, loading, error } = useAppSelector((state) => state.tags);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  const handleAddTag = async (tag: Omit<Tag, 'id'>) => {
    try {
      await dispatch(addTag(tag)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to add tag:', error);
      return false;
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await dispatch(deleteTag(tagId)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to delete tag:', error);
      return false;
    }
  };

  const handleMergeTags = async (tagIds: string[]) => {
    try {
      await dispatch(mergeTags(tagIds)).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to merge tags:', error);
      return false;
    }
  };

  const handleUpdateCount = (tagId: string, count: number) => {
    dispatch(updateTagCount({ tagId, count }));
  };

  return {
    tags,
    loading,
    error,
    addTag: handleAddTag,
    deleteTag: handleDeleteTag,
    mergeTags: handleMergeTags,
    updateTagCount: handleUpdateCount,
  };
};