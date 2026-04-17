import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useProductStore } from "../../store/store";
import {
  getConfiguredCategories,
  MATERIAL_OPTIONS,
  resolveCategoryValue,
} from "../../utils/catalog";
import { getApiMessage, slugify } from "../../utils/helpers";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(1),
  price: z.coerce.number().min(0),
  discountPrice: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  stock: z.coerce.number().int().min(0),
  sku: z.string().min(2),
  metalType: z.string().min(2),
  featured: z.boolean().optional(),
});

function Products() {
  const products = useProductStore((state) => state.products);
  const categories = useProductStore((state) => state.categories);
  const adminLoading = useProductStore((state) => state.adminLoading);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const fetchCategories = useProductStore((state) => state.fetchCategories);
  const createProduct = useProductStore((state) => state.createProduct);
  const uploadProductImages = useProductStore((state) => state.uploadProductImages);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const [editingId, setEditingId] = useState("");
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const displayCategories = getConfiguredCategories(categories);
  const { register, handleSubmit, reset, setValue, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      discountPrice: "",
      stock: 0,
      sku: "",
      metalType: "gold",
      featured: false,
    },
  });

  useEffect(() => {
    const loadProductsPage = async () => {
      try {
        setMessage("");
        await Promise.all([
          fetchCategories(),
          fetchProducts({ limit: 20, sortBy: "createdAt", order: "desc" }),
        ]);
      } catch (error) {
        setMessage(getApiMessage(error, "Unable to load products"));
      }
    };

    loadProductsPage();
  }, [fetchProducts, fetchCategories]);

  const resetForm = () => {
    setEditingId("");
    setFiles([]);
    reset({
      name: "",
      description: "",
      category: "",
      price: 0,
      discountPrice: "",
      stock: 0,
      sku: "",
      metalType: "gold",
      featured: false,
    });
  };

  const populateForm = (product) => {
    setEditingId(product._id || "");
    setFiles([]);
    setValue("name", product.name);
    setValue("description", product.description);
    setValue("category", product.category?._id || product.category || "");
    setValue("price", product.price);
    setValue("discountPrice", product.discountPrice || "");
    setValue("stock", product.stock);
    setValue("sku", product.sku);
    setValue("metalType", product.metalType || "gold");
    setValue("featured", Boolean(product.featured));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl">{editingId ? "Edit product" : "Add product"}</h1>
          {editingId ? (
            <button className="text-sm text-gold" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(async (values, event) => {
            setMessage("");
            try {
              const resolvedCategoryId = resolveCategoryValue(values.category, categories);
              const submitAction = event?.nativeEvent?.submitter?.value || "create";

              if (!resolvedCategoryId) {
                setMessage("Please select a valid category.");
                return;
              }

              const payload = {
                ...values,
                category: resolvedCategoryId,
                slug: slugify(values.name),
                discountPrice: values.discountPrice === "" ? undefined : Number(values.discountPrice),
              };

              let result;
              if (editingId) {
                await updateProduct(editingId, payload);
                if (files.length) {
                  await uploadProductImages(editingId, files);
                }
              } else {
                result = await createProduct(payload, files);
              }

              if (editingId) {
                setMessage("Product updated successfully.");
                resetForm();
              } else if (submitAction === "createAndAddAnother") {
                setMessage(result?.imageUploadError || "Product created successfully. Add the next product below.");
                resetForm();
              } else {
                const createdProduct = result?.product;
                setMessage(result?.imageUploadError || "Product created successfully.");
                if (createdProduct) {
                  populateForm({
                    ...payload,
                    _id: createdProduct._id,
                    category: categories.find((category) => category._id === resolvedCategoryId) || {
                      _id: resolvedCategoryId,
                    },
                  });
                }
              }

              await fetchProducts({ limit: 20, sortBy: "createdAt", order: "desc" });
            } catch (error) {
              setMessage(getApiMessage(error, "Unable to save product"));
            }
          })}
        >
          <Input label="Product name" error={formState.errors.name?.message} {...register("name")} />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-smoke">Description</span>
            <textarea
              rows="4"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              {...register("description")}
            />
            {formState.errors.description?.message ? (
              <span className="text-sm text-rose-300">{formState.errors.description.message}</span>
            ) : null}
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-smoke">Category</span>
            <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3" {...register("category")}>
              <option value="">ALL CATEGORIES</option>
              {displayCategories.map((category) => (
                <option key={category.slug} value={category.value}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Price" type="number" error={formState.errors.price?.message} {...register("price")} />
            <Input
              label="Discount price"
              type="number"
              error={formState.errors.discountPrice?.message}
              {...register("discountPrice")}
            />
            <Input label="Stock" type="number" error={formState.errors.stock?.message} {...register("stock")} />
            <Input label="SKU" error={formState.errors.sku?.message} {...register("sku")} />
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-smoke">Material Type</span>
            <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3" {...register("metalType")}>
              {MATERIAL_OPTIONS.map((material) => (
                <option key={material} value={material}>
                  {material.toUpperCase()}
                </option>
              ))}
            </select>
            {formState.errors.metalType?.message ? (
              <span className="text-sm text-rose-300">{formState.errors.metalType.message}</span>
            ) : null}
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3">
            <input type="checkbox" {...register("featured")} />
            <span className="text-sm">Feature this product on the storefront</span>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-smoke">Images</span>
            <input type="file" accept="image/*" multiple onChange={(event) => setFiles([...event.target.files])} />
            <p className="text-xs text-smoke">
              Select multiple images for one product. The first selected image will be used as the primary image on cards and the product page.
            </p>
            {files.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-smoke">
                {files.map((file) => file.name).join(", ")}
              </div>
            ) : null}
          </label>

          {message ? <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            {!editingId ? (
              <Button type="submit" name="submitAction" value="createAndAddAnother" disabled={adminLoading}>
                {adminLoading ? "Saving..." : "Create Product And Add"}
              </Button>
            ) : null}
            <Button type="submit" name="submitAction" value="create" disabled={adminLoading}>
              {adminLoading ? "Saving..." : editingId ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Inventory</h2>
            <p className="mt-2 text-sm text-smoke">{products.length} product{products.length === 1 ? "" : "s"} available</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {products.map((product) => (
            <div key={product._id} className="flex flex-col gap-4 rounded-[24px] border border-white/10 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold">{product.name}</p>
                <p className="text-sm text-smoke">{product.category?.name || "Uncategorized"}</p>
                <p className="mt-1 text-sm text-gold">
                  Rs. {product.discountPrice || product.price} • Stock {product.stock}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    populateForm(product);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    try {
                      await deleteProduct(product._id);
                      await fetchProducts({ limit: 20, sortBy: "createdAt", order: "desc" });
                      setMessage("Product deleted successfully.");
                    } catch (error) {
                      setMessage(getApiMessage(error, "Unable to delete product"));
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {!products.length ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-10 text-center text-sm text-smoke">
              No products are showing yet. Create one above and it will appear here.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Products;
