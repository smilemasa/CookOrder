import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DishForm from "../components/DishForm";

const API_URL = "<ここに既存APIのエンドポイントを指定>";

const DishDetailPage = () => {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/dishes/${id}`)
      .then((res) => res.json())
      .then((data) => setDish(data));
  }, [id]);

  const handleUpdate = (updatedDish) => {
    fetch(`${API_URL}/dishes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDish),
    }).then((res) => res.ok && navigate("/"));
  };

  if (!dish) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>料理詳細・編集</h1>
      <DishForm onSubmit={handleUpdate} initialDish={dish} />
      <button onClick={() => navigate("/")}>戻る</button>
    </div>
  );
};

export default DishDetailPage;
