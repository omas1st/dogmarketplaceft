import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
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
  type: "all",
  minPrice: "",
  maxPrice: "",
};

/* How many items to reveal per page */
const PAGE_SIZE = 50;

/* Background image for the hero section.
   Served from public/ at runtime — never processed by webpack's CSS loader. */
const HERO_IMAGE = 'url("/logobk.png")';

/* Fisher-Yates shuffle — returns a new array, never mutates input */
function shuffleArray(input) {
  const arr = Array.isArray(input) ? [...input] : [];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Home() {
  const { isAdmin } = useAuth();

  const [tab, setTab] = useState("dog_supply");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  /* Visible items currently rendered */
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Full fetched pool + remaining shuffled pool — kept in refs so mutating
     them doesn't trigger re-renders. */
  const allRef = useRef([]);
  const poolRef = useRef([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { itemType: tab };

      if (search) params.search = search;
      if (filters.type !== "all") params.type = filters.type;
      if (filters.minPrice !== "") params.minPrice = filters.minPrice;
      if (filters.maxPrice !== "") params.maxPrice = filters.maxPrice;

      const { data } = await API.get("/products", { params });
      const raw = data.products || data || [];

      allRef.current = raw;

      /* Shuffle once, prime the pool, reveal the first page */
      const shuffled = shuffleArray(raw);
      poolRef.current = shuffled.slice(PAGE_SIZE);
      setProducts(shuffled.slice(0, PAGE_SIZE));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load the marketplace. Please try again."
      );
      allRef.current = [];
      poolRef.current = [];
      setProducts([]);
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
  };

  /* Items are already in shuffled order from fetch / show-more,
     so the visible list is used as-is. */
  const sortedProducts = useMemo(() => products, [products]);

  /* Total unique items available for this filter set */
  const totalPool = allRef.current.length;

  /* Show More is available whenever there is at least one item to draw from */
  const canShowMore = totalPool > 0;

  /* Append the next 50 items. When the shuffled pool runs dry, start a
     fresh shuffle so the button never stops producing results. */
  const handleShowMore = () => {
    if (!allRef.current.length) return;

    let pool = poolRef.current;
    const next = [];
    let needed = PAGE_SIZE;
    let safety = 0;

    while (needed > 0 && safety < 100) {
      if (pool.length === 0) {
        pool = shuffleArray(allRef.current);
      }

      const take = Math.min(needed, pool.length);
      next.push(...pool.slice(0, take));
      pool = pool.slice(take);
      needed -= take;

      safety += 1;
    }

    poolRef.current = pool;
    setProducts((prev) => [...prev, ...next]);
  };

  return (
    <div className="home">
      <section
        className="home-hero"
        style={{ "--hero-image": HERO_IMAGE }}
      >
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

        {/* Sort dropdown intentionally hidden — no `sort` / `onSortChange`
            props passed. Items always display in shuffled random order. */}
        <Filters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
        />
      </div>

      <section className="marketplace" id="marketplace">
        <div className="marketplace-head">
          <h2>Marketplace</h2>

          {/* Item counts visible to admin only */}
          {isAdmin && !loading && !error && (
            <span className="marketplace-count">
              {sortedProducts.length} shown · {totalPool} available
            </span>
          )}
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
          <>
            <ProductGrid products={sortedProducts} />

            {canShowMore && (
              <div className="marketplace-more">
                <button
                  type="button"
                  className="btn-primary show-more-btn"
                  onClick={handleShowMore}
                >
                  Show More Items
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}