import React from "react";
import { useNavigate } from "react-router-dom";
import DishForm from "../components/DishForm";

const API_URL = "<ここに既存APIのエンドポイントを指定>";

const AddDishPage = () => {
  const navigate = useNavigate();

  const handleAdd = (dish) => {
    fetch(`${API_URL}/dishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dish),
    }).then((res) => res.ok && navigate("/"));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>料理を追加</h1>
      <DishForm onSubmit={handleAdd} />
      <button onClick={() => navigate("/")}>戻る</button>
    </div>
  );
};

export default AddDishPage;
