export function createMeta({
  page,
  limit,
  total,
}: {
  page: number;
  limit: number;
  total: number;
}) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
