import React, { useEffect, useState } from "react";
import DishCard from "../components/DishCard";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Grid,
  TextField,
  Box,
} from "@mui/material";

const API_URL = import.meta.env.VITE_MANAGEMENT_API;

const DishListPage = () => {
  const [dishes, setDishes] = useState([]);
  const [searchJa, setSearchJa] = useState("");
  const [searchEn, setSearchEn] = useState("");
  const navigate = useNavigate();

  const fetchDishes = (params = {}) => {
    let url = `${API_URL}/dishes`;
    const query = [];
    if (params.nameJa)
      query.push(`nameJa=${encodeURIComponent(params.nameJa)}`);
    if (params.nameEn)
      query.push(`nameEn=${encodeURIComponent(params.nameEn)}`);
    if (query.length > 0)
      url = `${API_URL}/dishes/search?${query.join("&")}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setDishes(data));
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDishes({ nameJa: searchJa, nameEn: searchEn });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        料理一覧
      </Typography>
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ display: "flex", gap: 2, mb: 3 }}
      >
        <TextField
          label="日本語名で検索"
          value={searchJa}
          onChange={(e) => setSearchJa(e.target.value)}
          size="small"
        />
        <TextField
          label="英語名で検索"
          value={searchEn}
          onChange={(e) => setSearchEn(e.target.value)}
          size="small"
        />
        <Button type="submit" variant="outlined">
          検索
        </Button>
        <Button
          variant="text"
          onClick={() => {
            setSearchJa("");
            setSearchEn("");
            fetchDishes();
          }}
        >
          リセット
        </Button>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/add")}
        sx={{ mb: 3 }}
      >
        料理を追加
      </Button>
      <Grid container spacing={2}>
        {dishes.map((dish, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <DishCard
              dish={dish}
              onClick={() => navigate(`/detail/${dish.id || idx}`)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DishListPage;
