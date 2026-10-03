import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import ItemForm from "../components/ItemForm";
import Loader from "../components/Loader";
import "./EditItem.css";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        const product = data.product || data;

        if (mounted) {
          const images =
            Array.isArray(product.images) && product.images.length
              ? product.images
              : product.image
              ? [product.image]
              : [];

          setInitialValues({
            itemType: product.itemType,
            title: product.title,
            description: product.description,
            originalPrice: product.originalPrice,
            discountPercent: product.discountPercent,
            category: product.category,
            stockStatus: product.stockStatus,
            image: product.image,
            images,
            sizes: (product.sizes || []).join(", "),
          });
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message || "This item could not be loaded."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (payload) => {
    setBusy(true);
    setError("");

    try {
      await API.put(`/products/${id}`, payload);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "The item could not be updated.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader label="Loading item..." />;

  return (
    <div className="edit-item-page">
      <h1>Edit Item</h1>
      {error && <p className="error">{error}</p>}
      {initialValues && (
        <ItemForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="Update Item"
          busy={busy}
        />
      )}
    </div>
  );
}