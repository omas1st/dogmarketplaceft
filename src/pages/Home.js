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

/* Background image for the hero section. */
const HERO_IMAGE = 'url("/logobk.png")';

/* Support address for the floating chat button */
const SUPPORT_EMAIL = "dogmarketplacesupply@gmail.com";

/* Build a Gmail compose URL with a helpful prefilled subject & body */
const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
  SUPPORT_EMAIL
)}&su=${encodeURIComponent("Support Request — Dog Marketplace")}&body=${encodeURIComponent(
  "Hi Dog Marketplace Support,\n\nI need help with:\n\n\n— Sent from the Dog Marketplace website"
)}`;

/* Fisher-Yates shuffle */
function shuffleArray(input) {
  const arr = Array.isArray(input) ? [...input] : [];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* Floating chat button — small, draggable, snaps back on release */
function ChatNowButton() {
  /* Position stored as { x, y } in px from top-left of viewport.
     Initialised lazily to the bottom-right corner. */
  const [pos, setPos] = useState(() => ({
    x: typeof window !== "undefined" ? window.innerWidth - 70 : 0,
    y: typeof window !== "undefined" ? window.innerHeight - 150 : 0,
  }));
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const moved = useRef(false);

  /* Match the CSS dimensions of the circular button */
  const BUTTON_SIZE = 58;
  const EDGE_GAP = 12;

  /* Clamp the position so the button stays on screen */
  const clamp = (x, y) => {
    if (typeof window === "undefined") return { x, y };
    const maxX = window.innerWidth - BUTTON_SIZE - EDGE_GAP;
    const maxY = window.innerHeight - BUTTON_SIZE - EDGE_GAP;
    return {
      x: Math.max(EDGE_GAP, Math.min(maxX, x)),
      y: Math.max(EDGE_GAP, Math.min(maxY, y)),
    };
  };

  /* Keep the button inside the viewport if the window is resized */
  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => clamp(prev.x, prev.y));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerDown = (event) => {
    /* Ignore right-clicks and multi-touch */
    if (event.button !== undefined && event.button !== 0) return;

    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: pos.x,
      startY: pos.y,
    };
    moved.current = false;
    setDragging(true);

    /* Bind to window so the drag continues outside the button */
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
  };

  const handlePointerMove = (event) => {
    if (!dragStart.current) return;

    const point = event.touches ? event.touches[0] : event;
    if (!point) return;

    const dx = point.clientX - dragStart.current.pointerX;
    const dy = point.clientY - dragStart.current.pointerY;

    /* Anything beyond a few pixels counts as a drag, not a click */
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      moved.current = true;
    }

    const next = clamp(
      dragStart.current.startX + dx,
      dragStart.current.startY + dy
    );
    setPos(next);

    /* Prevent page scroll while dragging on touch devices */
    if (event.cancelable) event.preventDefault();
  };

  const handlePointerUp = () => {
    dragStart.current = null;
    setDragging(false);

    window.removeEventListener("mousemove", handlePointerMove);
    window.removeEventListener("mouseup", handlePointerUp);
    window.removeEventListener("touchmove", handlePointerMove);
    window.removeEventListener("touchend", handlePointerUp);
  };

  /* Cleanup if unmounted mid-drag */
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (event) => {
    /* If the pointer moved, treat it as a drag, not a click */
    if (moved.current) {
      event.preventDefault();
      moved.current = false;
      return;
    }
    window.open(GMAIL_COMPOSE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      className={`chat-now-btn ${dragging ? "dragging" : ""}`}
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onClick={handleClick}
      aria-label="Chat with Dog Marketplace Support"
      title="Chat with us"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="9" cy="10" r="0.6" fill="currentColor" />
        <circle cx="12" cy="10" r="0.6" fill="currentColor" />
        <circle cx="15" cy="10" r="0.6" fill="currentColor" />
      </svg>
      <span className="chat-now-label">Chat</span>
    </button>
  );
}

export default function Home() {
  const { isAdmin } = useAuth();

  const [tab, setTab] = useState("dog_supply");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const sortedProducts = useMemo(() => products, [products]);

  const totalPool = allRef.current.length;
  const canShowMore = totalPool > 0;

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

        <Filters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
        />
      </div>

      <section className="marketplace" id="marketplace">
        <div className="marketplace-head">
          <h2>Marketplace</h2>

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

      {/* Floating draggable chat button — bottom-right by default */}
      <ChatNowButton />
    </div>
  );
}