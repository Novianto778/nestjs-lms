import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const COURSE_INDEX = 'courses';

export const courseMapping = {
  properties: {
    id: { type: 'keyword' },
    title: {
      type: 'text', // For full-text search
    },
    title_suggest: {
      // For autocomplete
      type: 'completion',
      analyzer: 'simple',
      preserve_separators: true,
      preserve_position_increments: true,
      max_input_length: 50,
    },
    description: { type: 'text' },
    instructorName: { type: 'text' },
    price: { type: 'integer' },
    isPublished: { type: 'boolean' },
  },
} satisfies MappingTypeMapping;
