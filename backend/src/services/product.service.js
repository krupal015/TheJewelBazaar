export const buildProductFilters = (query) => {
  const filters = {};

  if (query.search) {
    filters.$text = { $search: query.search };
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) {
      filters.price.$gte = Number(query.minPrice);
    }
    if (query.maxPrice) {
      filters.price.$lte = Number(query.maxPrice);
    }
  }

  if (query.inStock === "true") {
    filters.stock = { $gt: 0 };
  }

  return filters;
};

export const buildProductSort = (sortBy = "createdAt", order = "desc") => ({
  [sortBy]: order === "asc" ? 1 : -1,
});
