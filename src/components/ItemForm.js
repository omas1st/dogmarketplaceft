import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { money } from "../utils/format";
import "./ItemForm.css";

export const CATEGORY_OPTIONS = [
  { value: "dog_clothing_accessories", label: "Dog; Clothing and Accessories" },
  { value: "food_chews_feeding", label: "Food, Chews and Feeding" },
  { value: "bed", label: "Bed" },
  { value: "collar_leashes_harnesses", label: "Collar, Leashes and Harnesses" },
  { value: "toy", label: "Toy" },
  { value: "crates_gates_pens", label: "Crates, Gates and Pens" },
];

export const DEFAULT_SIZES = "XS, S, M, L, XL, XXL";

const MAX_IMAGES = 4;

const EMPTY_FORM = {
  itemType: "dog_supply",
  title: "",
  description: "",
  originalPrice: "",
  discountPercent: 20,
  category: "dog_clothing_accessories",
  stockStatus: "in_stock",
  sizes: DEFAULT_SIZES,
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
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialValues) {
      setForm({ ...EMPTY_FORM, ...initialValues });
      setImages(buildInitialImages(initialValues));
    }
  }, [initialValues]);

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const sellingPrice = useMemo(() => {
    const original = parseFloat(form.originalPrice);
    if (Number.isNaN(original)) return "";

    const discount = parseFloat(form.discountPercent);
    const safeDiscount = Number.isNaN(discount) ? 0 : discount;
    const selling = original - (original * safeDiscount) / 100;

    return selling.toFixed(2);
  }, [form.originalPrice, form.discountPercent]);

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
    if (Number.isNaN(parseFloat(form.originalPrice))) {
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

    onSubmit({
      itemType: form.itemType,
      title: form.title.trim(),
      description: form.description.trim(),
      originalPrice: Number(form.originalPrice),
      discountPercent: Number(form.discountPercent) || 0,
      sellingPrice: Number(sellingPrice),
      category: form.category,
      stockStatus: form.stockStatus,
      sizes: form.sizes
        ? form.sizes
            .split(",")
            .map((size) => size.trim())
            .filter(Boolean)
        : [],
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

      <div className="auth-row">
        <label className="auth-field">
          Original Price ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.originalPrice}
            onChange={(event) => update("originalPrice", event.target.value)}
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
            onChange={(event) => update("discountPercent", event.target.value)}
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

      <div className="auth-row">
        <label className="auth-field">
          Category
          <select
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
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
      </div>

      <label className="auth-field">
        Available Sizes (comma separated)
        <input
          type="text"
          value={form.sizes}
          onChange={(event) => update("sizes", event.target.value)}
          placeholder="XS, S, M, L, XL, XXL"
        />
      </label>

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
          <button
            type="button"
            className="image-slot-add"
            onClick={addSlot}
          >
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