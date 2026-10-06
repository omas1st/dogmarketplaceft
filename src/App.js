import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDropdown from "./components/CartDropdown";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AnalyticsTracker from "./components/AnalyticsTracker";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import CreateAccount from "./pages/CreateAccount";
import ProductPreview from "./pages/ProductPreview";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Processing from "./pages/Processing";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import NotFound from "./pages/NotFound";

function Layout({ children }) {
  return (
    <>
      <Header />
      <CartDropdown />
      <main className="app-main">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <div className="App">
      {/* Fires a GA4 pageview on every route change.
          Placed outside <Routes> so it mounts exactly once. */}
      <AnalyticsTracker />

      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/signin"
          element={
            <Layout>
              <SignIn />
            </Layout>
          }
        />

        <Route
          path="/create-account"
          element={
            <Layout>
              <CreateAccount />
            </Layout>
          }
        />

        <Route
          path="/product/:id"
          element={
            <Layout>
              <ProductPreview />
            </Layout>
          }
        />

        <Route
          path="/cart"
          element={
            <Layout>
              <Cart />
            </Layout>
          }
        />

        <Route
          path="/checkout"
          element={
            <Layout>
              <Checkout />
            </Layout>
          }
        />

        <Route
          path="/processing"
          element={
            <Layout>
              <Processing />
            </Layout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <UserDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/items/new"
          element={
            <AdminRoute>
              <Layout>
                <AddItem />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/items/:id/edit"
          element={
            <AdminRoute>
              <Layout>
                <EditItem />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </div>
  );
}