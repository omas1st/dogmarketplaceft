import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { money } from "../utils/format";
import "./ItemForm.css";

export const CATEGORY_OPTIONS = [
  { value: "dog_clothing_accessories", label: "Dog; Clothing and Accessories" },
  { value: "food", label: "Food" },
  { value: "chews", label: "Chews" },
  { value: "feeding", label: "Feeding" },
  { value: "bed", label: "Bed" },
  { value: "collar_leashes_harnesses", label: "Collar, Leashes and Harnesses" },
  { value: "toy", label: "Toy" },
  { value: "crates_gates_pens", label: "Crates, Gates and Pens" },
];

export const DEFAULT_SIZES = "XS, S, M, L, XL, XXL";

/* Default food-size options shown when a Food product is created for the
   first time. Prices are blank and must be filled by the admin. */
export const DEFAULT_FOOD_SIZES = [
  { size: "5-lb bag", price: "" },
  { size: "15-lb bag", price: "" },
  { size: "30-lb bag", price: "" },
  { size: "60-lb bag", price: "" },
];

const MAX_IMAGES = 4;
const FOOD_CATEGORIES = ["food", "food_chews_feeding"];

const EMPTY_FORM = {
  itemType: "dog_supply",
  title: "",
  description: "",
  originalPrice: "",
  discountPercent: 20,
  category: "dog_clothing_accessories",
  stockStatus: "in_stock",
  sizes: DEFAULT_SIZES,
  colors: "",
};

function buildInitialImages(initialValues) {
  if (!initialValues) return [""];

  const source =
    Array.isArray(initialValues.images) && initialValues.images.length
      ? initialValues.images
      : initialValues.image
      ? [initialValues.image]
      : [];

  const list = source.map((url) => String(url || "").trim()).filter(Boolean);

  if (list.length === 0) return [""];
  if (list.length >= MAX_IMAGES) return list.slice(0, MAX_IMAGES);
  return [...list, ""];
}

function buildInitialFoodSizes(initialValues, category) {
  if (!FOOD_CATEGORIES.includes(category)) return [];

  if (
    initialValues &&
    Array.isArray(initialValues.foodSizes) &&
    initialValues.foodSizes.length
  ) {
    return initialValues.foodSizes.map((fs) => ({
      size: String(fs.size || "").trim(),
      price: fs.price === 0 || fs.price === undefined ? "" : String(fs.price),
    }));
  }

  return DEFAULT_FOOD_SIZES.map((fs) => ({ ...fs }));
}

const UploadIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function ItemForm({
  initialValues,
  onSubmit,
  submitLabel = "Save & Publish Item",
  busy,
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initialValues || {}) });
  const [images, setImages] = useState(() => buildInitialImages(initialValues));
  const [foodSizes, setFoodSizes] = useState(() =>
    buildInitialFoodSizes(
      initialValues,
      (initialValues && initialValues.category) || EMPTY_FORM.category
    )
  );
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialValues) {
      const nextForm = { ...EMPTY_FORM, ...initialValues };
      setForm(nextForm);
      setImages(buildInitialImages(initialValues));
      setFoodSizes(buildInitialFoodSizes(initialValues, nextForm.category));
    }
  }, [initialValues]);

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCategoryChange = (nextCategory) => {
    setForm((prev) => ({ ...prev, category: nextCategory }));

    if (FOOD_CATEGORIES.includes(nextCategory)) {
      setFoodSizes((prev) =>
        prev && prev.length
          ? prev
          : DEFAULT_FOOD_SIZES.map((fs) => ({ ...fs }))
      );
    }
  };

  const sellingPrice = useMemo(() => {
    const original = parseFloat(form.originalPrice);
    if (Number.isNaN(original)) return "";

    const discount = parseFloat(form.discountPercent);
    const safeDiscount = Number.isNaN(discount) ? 0 : discount;
    const selling = original - (original * safeDiscount) / 100;

    return selling.toFixed(2);
  }, [form.originalPrice, form.discountPercent]);

  const isFood = FOOD_CATEGORIES.includes(form.category);

  /* Discounted preview for a food size — original price minus discount % */
  const discountedFoodPrice = (price) => {
    const p = Number(price) || 0;
    const d = Number(form.discountPercent) || 0;
    if (p <= 0) return "";
    return (p * (1 - d / 100)).toFixed(2);
  };

  /* --- Image slot management --- */
  const updateImageAt = (index, value) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addSlot = () => {
    setImages((prev) => {
      if (prev.length >= MAX_IMAGES) return prev;
      return [...prev, ""];
    });
  };

  const removeSlot = (index) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [""];
    });
  };

  const handleFileUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateImageAt(index, data.url || data.secure_url || "");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Image upload failed. Please try the URL option instead."
      );
    } finally {
      setUploadingIndex(null);
      event.target.value = "";
    }
  };

  /* --- Food size management --- */
  const updateFoodSize = (index, key, value) => {
    setFoodSizes((prev) =>
      prev.map((fs, i) => (i === index ? { ...fs, [key]: value } : fs))
    );
  };

  const addFoodSizeRow = () => {
    setFoodSizes((prev) => [...prev, { size: "", price: "" }]);
  };

  const removeFoodSizeRow = (index) => {
    setFoodSizes((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [{ size: "", price: "" }];
    });
  };

  /* --- Submit --- */
  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter the item name/title.");
      return;
    }
    if (!form.description.trim()) {
      setError("Please enter the product description.");
      return;
    }

    /* Non-food: validate original price. Food: skip this — per-size
       prices are validated below instead. */
    if (!isFood && Number.isNaN(parseFloat(form.originalPrice))) {
      setError("Please enter a valid original price.");
      return;
    }

    const cleanImages = images
      .map((url) => String(url || "").trim())
      .filter(Boolean)
      .slice(0, MAX_IMAGES);

    if (cleanImages.length === 0) {
      setError("Please add at least one product image.");
      return;
    }

    const cleanColors = isFood
      ? []
      : Array.from(
          new Set(
            String(form.colors || "")
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          )
        );

    let cleanFoodSizes = [];
    if (isFood) {
      cleanFoodSizes = foodSizes
        .map((fs) => ({
          size: String(fs.size || "").trim(),
          price: Number(fs.price) > 0 ? Number(fs.price) : 0,
        }))
        .filter((fs) => fs.size && fs.price > 0);

      if (cleanFoodSizes.length === 0) {
        setError(
          "Please add at least one food size with a valid price (greater than 0)."
        );
        return;
      }
    }

    const cleanSizes = isFood
      ? cleanFoodSizes.map((fs) => fs.size)
      : form.sizes
      ? form.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    onSubmit({
      itemType: form.itemType,
      title: form.title.trim(),
      description: form.description.trim(),
      /* Food products don't have a top-level original price — the
         per-size prices carry the full cost data. */
      originalPrice: isFood ? 0 : Number(form.originalPrice),
      discountPercent: Number(form.discountPercent) || 0,
      sellingPrice: isFood ? 0 : Number(sellingPrice),
      category: form.category,
      stockStatus: form.stockStatus,
      sizes: cleanSizes,
      colors: cleanColors,
      foodSizes: cleanFoodSizes,
      image: cleanImages[0],
      images: cleanImages,
    });
  };

  const filledCount = images.filter((url) => String(url || "").trim()).length;

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <label className="auth-field">
        Item Type
        <select
          value={form.itemType}
          onChange={(event) => update("itemType", event.target.value)}
        >
          <option value="dog_supply">Dog Supply</option>
          <option value="dog_adoption">Dog for Adoption</option>
        </select>
      </label>

      <label className="auth-field">
        Item Name / Title
        <input
          type="text"
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="e.g. Chew-Proof Bone Toy"
        />
      </label>

      <label className="auth-field">
        Product Description
        <textarea
          rows="5"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Describe the item, materials, sizing and care..."
        />
      </label>

      {/* Category — placed directly after Description */}
      <label className="auth-field">
        Category
        <select
          value={form.category}
          onChange={(event) => handleCategoryChange(event.target.value)}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="auth-field">
        Inventory Stock
        <select
          value={form.stockStatus}
          onChange={(event) => update("stockStatus", event.target.value)}
        >
          <option value="in_stock">In Stock</option>
          <option value="out_stock">Out of Stock</option>
        </select>
      </label>

      {/* Colors — not shown for food */}
      {!isFood && (
        <label className="auth-field">
          Available Colors (comma separated, optional)
          <input
            type="text"
            value={form.colors || ""}
            onChange={(event) => update("colors", event.target.value)}
            placeholder="e.g. Red, Blue, Green, Black"
          />
          <span className="field-hint">
            Leave blank if this product has no color options.
          </span>
        </label>
      )}

      {/* Price row — original price + discount + auto selling.
          Shown for non-food ONLY. Food uses per-size pricing below. */}
      {!isFood && (
        <div className="auth-row">
          <label className="auth-field">
            Original Price ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.originalPrice}
              onChange={(event) =>
                update("originalPrice", event.target.value)
              }
              placeholder="99.99"
            />
          </label>

          <label className="auth-field">
            Discount Percentage (%)
            <input
              type="number"
              min="0"
              max="100"
              value={form.discountPercent}
              onChange={(event) =>
                update("discountPercent", event.target.value)
              }
            />
          </label>

          <label className="auth-field">
            Selling Price (auto)
            <input
              type="text"
              value={sellingPrice === "" ? "" : money(sellingPrice)}
              readOnly
              className="readonly-input"
            />
          </label>
        </div>
      )}

      {/* Food sizes & prices — Food only */}
      {isFood ? (
        <section className="food-size-section">
          <header className="food-size-header">
            <h3>Food Sizes &amp; Prices</h3>
            <span className="food-size-hint">
              Each size's price is the original price; the discount below is
              applied to every size.
            </span>
          </header>

          <label className="auth-field food-size-discount-field">
            Discount Percentage (%)
            <input
              type="number"
              min="0"
              max="100"
              value={form.discountPercent}
              onChange={(event) =>
                update("discountPercent", event.target.value)
              }
            />
            <span className="field-hint">
              Applied to all size prices below.
            </span>
          </label>

          <div className="food-size-list">
            {foodSizes.map((fs, index) => (
              <div className="food-size-row" key={index}>
                <input
                  type="text"
                  className="food-size-input"
                  placeholder="Size (e.g. 15-lb bag)"
                  value={fs.size}
                  onChange={(event) =>
                    updateFoodSize(index, "size", event.target.value)
                  }
                />
                <div className="food-size-price-wrap">
                  <input
                    type="number"
                    className="food-price-input"
                    min="0"
                    step="0.01"
                    placeholder="Original $"
                    value={fs.price}
                    onChange={(event) =>
                      updateFoodSize(index, "price", event.target.value)
                    }
                  />
                  {fs.price && Number(fs.price) > 0 && (
                    <span className="food-size-discounted">
                      → {money(discountedFoodPrice(fs.price))} after{" "}
                      {Number(form.discountPercent) || 0}% off
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="food-size-remove"
                  onClick={() => removeFoodSizeRow(index)}
                  aria-label={`Remove ${fs.size || "size"}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="food-size-add"
            onClick={addFoodSizeRow}
          >
            + Add size
          </button>
        </section>
      ) : (
        <label className="auth-field">
          Available Sizes (comma separated)
          <input
            type="text"
            value={form.sizes}
            onChange={(event) => update("sizes", event.target.value)}
            placeholder="XS, S, M, L, XL, XXL"
          />
        </label>
      )}

      <section className="item-image-section">
        <header className="item-image-header">
          <h3>Product Images</h3>
          <span className="item-image-count">
            {filledCount} / {MAX_IMAGES} · first image is the card thumbnail
          </span>
        </header>

        <div className="image-slots">
          {images.map((url, index) => {
            const hasImage = !!String(url || "").trim();
            const isUploading = uploadingIndex === index;
            const isMain = index === 0;

            return (
              <div
                key={index}
                className={`image-slot ${hasImage ? "filled" : "empty"}`}
              >
                <div className="image-slot-preview">
                  {hasImage ? (
                    <img src={url} alt={`Product ${index + 1}`} />
                  ) : (
                    <span className="image-slot-number">{index + 1}</span>
                  )}
                  {isMain && hasImage && (
                    <span className="image-slot-badge">Main</span>
                  )}
                </div>

                <input
                  type="url"
                  className="image-slot-url"
                  placeholder={
                    hasImage
                      ? "Replace with image URL"
                      : isMain
                      ? "Paste main image URL"
                      : `Paste image ${index + 1} URL`
                  }
                  value={url}
                  onChange={(event) =>
                    updateImageAt(index, event.target.value)
                  }
                />

                <div className="image-slot-actions">
                  <label
                    className={`image-slot-upload ${
                      isUploading ? "busy" : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFileUpload(index, event)}
                      hidden
                      disabled={isUploading}
                    />
                    <UploadIcon />
                    <span>{isUploading ? "Uploading…" : "Upload"}</span>
                  </label>

                  {hasImage && (
                    <button
                      type="button"
                      className="image-slot-remove"
                      onClick={() => removeSlot(index)}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {images.length < MAX_IMAGES && (
          <button type="button" className="image-slot-add" onClick={addSlot}>
            + Add another image
          </button>
        )}
      </section>

      <button
        type="submit"
        className="btn-primary"
        disabled={busy || uploadingIndex !== null}
      >
        {busy ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}