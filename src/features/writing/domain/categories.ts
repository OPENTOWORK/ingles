import { z } from 'zod';
import {
  WRITING_CATEGORY_KEYS,
  type WritingCategoryKey,
  isWritingCategoryKey,
} from './public-constants';

/**
 * Closed semantic categories for the Interactive Writing Map (D3).
 * No colour, CSS class or styling data — category_key is independent from visual colour.
 */
export { WRITING_CATEGORY_KEYS, type WritingCategoryKey, isWritingCategoryKey };

export const writingCategoryKeySchema = z.enum(WRITING_CATEGORY_KEYS);
