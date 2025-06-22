import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DishListPage from "./pages/DishListPage";
import AddDishPage from "./pages/AddDishPage";
import DishDetailPage from "./pages/DishDetailPage";
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DishListPage />} />
        <Route path="/add" element={<AddDishPage />} />
        <Route path="/detail/:id" element={<DishDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
