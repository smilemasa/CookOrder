import React, { useState } from "react";

const initialState = {
  nameJa: "",
  nameEn: "",
  price: "",
  img: "",
};

const DishForm = ({ onSubmit, initialDish }) => {
  const [dish, setDish] = useState(initialDish || initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDish({ ...dish, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...dish, price: Number(dish.price) });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 320,
      }}
    >
      <label>
        日本語名
        <input
          name="nameJa"
          value={dish.nameJa}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        英語名
        <input
          name="nameEn"
          value={dish.nameEn}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        価格
        <input
          name="price"
          type="number"
          value={dish.price}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        画像URL
        <input name="img" value={dish.img} onChange={handleChange} required />
      </label>
      <button type="submit">保存</button>
    </form>
  );
};

export default DishForm;
