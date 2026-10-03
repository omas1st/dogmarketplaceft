import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import Tabs from "../components/Tabs";
import Filters from "../components/Filters";
import SearchBar from "../components/SearchBar";
import ProductGrid from "../components/ProductGrid";
import Loader from "../components/Loader";
import "./Home.css";

const TABS = [
  { value: "dog_supply", label: "Dog Supplies" },
  { value: "dog_adoption", label: "Dogs for Adoption" },
];

const DEFAULT_FILTERS = {
  shape: "all",
  type: "all",
  minPrice: "",
  maxPrice: "",
};

export default function Home() {
  const [tab, setTab] = useState("dog_supply");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("featured");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { itemType: tab };

      if (search) params.search = search;
      if (filters.shape !== "all") params.shape = filters.shape;
      if (filters.type !== "all") params.type = filters.type;
      if (filters.minPrice !== "") params.minPrice = filters.minPrice;
      if (filters.maxPrice !== "") params.maxPrice = filters.maxPrice;

      const { data } = await API.get("/products", { params });
      setProducts(data.products || data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load the marketplace. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [tab, search, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
    setSearch("");
    setSort("featured");
  };

  /* Client-side sort for the currently loaded products */
  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sort) {
      case "price-asc":
        return list.sort(
          (a, b) => Number(a.sellingPrice) - Number(b.sellingPrice)
        );
      case "price-desc":
        return list.sort(
          (a, b) => Number(b.sellingPrice) - Number(a.sellingPrice)
        );
      case "newest":
        return list.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "featured":
      default:
        return list;
    }
  }, [products, sort]);

  return (
    <div className="home">
      <section className="home-hero">
        <h1>Welcome to Dog Marketplace</h1>
        <p>
          Shop premium dog supplies and meet loving dogs waiting for a forever
          home.
        </p>
      </section>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="home-toolbar">
        <div className="home-toolbar-search">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearch}
          />
        </div>

        <Filters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          sort={sort}
          onSortChange={setSort}
          resultCount={products.length}
        />
      </div>

      <section className="marketplace" id="marketplace">
        <div className="marketplace-head">
          <h2>Marketplace</h2>
          <span className="marketplace-count">
            {!loading && !error ? `${products.length} item(s)` : ""}
          </span>
        </div>

        {loading ? (
          <Loader label="Loading marketplace..." />
        ) : error ? (
          <p className="error">{error}</p>
        ) : sortedProducts.length === 0 ? (
          <p className="empty-state">
            No items match your search. Try clearing the filters.
          </p>
        ) : (
          <ProductGrid products={sortedProducts} />
        )}
      </section>
    </div>
  );
}