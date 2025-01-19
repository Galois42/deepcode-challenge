// src/store/tagSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Tag {
  id: string;
  name: string;
  type: 'status' | 'risk' | 'application' | 'security' | 'custom';
  color?: string;
  count?: number;
}

interface TagState {
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

const initialState: TagState = {
  tags: [],
  loading: false,
  error: null,
};

// Async thunks for API interactions
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async () => {
    const response = await fetch('/api/tags');
    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }
    return response.json();
  }
);

export const addTag = createAsyncThunk(
  'tags/addTag',
  async (tag: Omit<Tag, 'id'>) => {
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tag),
    });
    if (!response.ok) {
      throw new Error('Failed to add tag');
    }
    return response.json();
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (tagId: string) => {
    const response = await fetch(`/api/tags/${tagId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete tag');
    }
    return tagId;
  }
);

export const mergeTags = createAsyncThunk(
  'tags/mergeTags',
  async (tagIds: string[]) => {
    const response = await fetch('/api/tags/merge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tagIds }),
    });
    if (!response.ok) {
      throw new Error('Failed to merge tags');
    }
    return response.json();
  }
);

const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    updateTagCount: (
      state,
      action: PayloadAction<{ tagId: string; count: number }>
    ) => {
      const tag = state.tags.find(t => t.id === action.payload.tagId);
      if (tag) {
        tag.count = action.payload.count;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tags
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tags';
      })
      // Add tag
      .addCase(addTag.fulfilled, (state, action) => {
        state.tags.push(action.payload);
      })
      // Delete tag
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter(tag => tag.id !== action.payload);
      })
      // Merge tags
      .addCase(mergeTags.fulfilled, (state, action) => {
        const mergedTag = action.payload;
        state.tags = state.tags.filter(tag => !action.meta.arg.includes(tag.id));
        state.tags.push(mergedTag);
      });
  },
});

export const { updateTagCount } = tagSlice.actions;
export default tagSlice.reducer;