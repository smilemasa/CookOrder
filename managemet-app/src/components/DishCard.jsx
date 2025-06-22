import React from "react";

// TypeScriptの型定義を削除し、JSXとして修正
const DishCard = ({ dish, onClick }) => {
  return (
    <div
      className="dish-card"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 16,
        margin: 8,
        width: 220,
      }}
    >
      <img
        src={dish.img}
        alt={dish.nameJa}
        style={{
          width: "100%",
          height: 120,
          objectFit: "cover",
          borderRadius: 6,
        }}
      />
      <h3>{dish.nameJa}</h3>
      <p style={{ color: "#888" }}>{dish.nameEn}</p>
      <p style={{ fontWeight: "bold" }}>
        {Number(dish.price).toLocaleString()}円
      </p>
    </div>
  );
};

export default DishCard;
