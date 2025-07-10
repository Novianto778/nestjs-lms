export const COURSE_INDEX = 'courses';

export const courseMapping = {
  mappings: {
    properties: {
      id: { type: 'keyword' },
      title: { type: 'text' },
      description: { type: 'text' },
      instructorName: { type: 'text' },
      price: { type: 'integer' },
      isPublished: { type: 'boolean' },
    },
  },
};
