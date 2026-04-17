export const DEFAULT_CATEGORIES = [
  { name: "RINGS", slug: "rings" },
  { name: "PENDANTS", slug: "pendants" },
  { name: "EARRINGS", slug: "earrings" },
  { name: "BRACELETS", slug: "bracelets" },
  { name: "NECKLACES", slug: "necklaces" },
];

export const MATERIAL_OPTIONS = [
  "platinum",
  "gold",
  "white gold",
  "rose gold",
  "diamond",
  "silver",
];

export const CATEGORY_DISPLAY_ORDER = [
  "rings",
  "pendants",
  "earrings",
  "bracelets",
  "necklaces",
];

const normalizeCategoryName = (value = "") => String(value).trim().toLowerCase();

export const getConfiguredCategories = (categories = []) =>
  [
    ...DEFAULT_CATEGORIES.map((defaultCategory) => {
      const matchedCategory = categories.find((category) => {
        const slug = normalizeCategoryName(category?.slug);
        const name = normalizeCategoryName(category?.name);
        return slug === defaultCategory.slug || name === defaultCategory.slug;
      });

      return {
        _id: matchedCategory?._id || "",
        name: defaultCategory.name,
        slug: defaultCategory.slug,
        value: matchedCategory?._id || defaultCategory.slug,
      };
    }),
    ...categories
      .filter((category) => {
        const normalizedSlug = normalizeCategoryName(category?.slug);
        const normalizedName = normalizeCategoryName(category?.name);
        return !DEFAULT_CATEGORIES.some(
          (defaultCategory) =>
            defaultCategory.slug === normalizedSlug || defaultCategory.slug === normalizedName,
        );
      })
      .map((category) => ({
        _id: category._id || "",
        name: String(category.name || "").trim().toUpperCase(),
        slug: category.slug,
        value: category._id || category.slug,
      })),
  ];

export const resolveCategoryValue = (value = "", categories = []) => {
  const normalizedValue = normalizeCategoryName(value);
  const matchedCategory = categories.find((category) => {
    const id = String(category?._id ?? "");
    const slug = normalizeCategoryName(category?.slug);
    const name = normalizeCategoryName(category?.name);
    return id === value || slug === normalizedValue || name === normalizedValue;
  });

  return matchedCategory?._id || "";
};

export const getMissingConfiguredCategories = (categories = []) => {
  const knownCategories = new Set(
    categories.flatMap((category) => [
      normalizeCategoryName(category?.slug),
      normalizeCategoryName(category?.name),
    ]),
  );

  return DEFAULT_CATEGORIES.filter(
    (category) =>
      !knownCategories.has(normalizeCategoryName(category.slug))
      && !knownCategories.has(normalizeCategoryName(category.name)),
  ).map((category) => ({
    name: category.name,
    slug: category.slug,
  }));
};

export const sortCategoriesForDisplay = (categories = []) =>
  [...categories].sort((first, second) => {
    const firstName = String(first?.name ?? "").trim().toLowerCase();
    const secondName = String(second?.name ?? "").trim().toLowerCase();
    const firstIndex = CATEGORY_DISPLAY_ORDER.indexOf(firstName);
    const secondIndex = CATEGORY_DISPLAY_ORDER.indexOf(secondName);

    if (firstIndex === -1 && secondIndex === -1) {
      return firstName.localeCompare(secondName);
    }

    if (firstIndex === -1) {
      return 1;
    }

    if (secondIndex === -1) {
      return -1;
    }

    return firstIndex - secondIndex;
  });
