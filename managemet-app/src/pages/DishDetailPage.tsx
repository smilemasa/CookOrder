import {
    ArrowBack as ArrowBackIcon,
    Cancel as CancelIcon,
    Edit as EditIcon,
    Save as SaveIcon
} from "@mui/icons-material"
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material"
import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useGetDishById, useUpdateDish } from "../api/hooks"
import { Dish } from "../api/services"

const DishDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editedDish, setEditedDish] = useState<Partial<Dish>>({})

  const {
    data: dish,
    isLoading,
    error,
    refetch
  } = useGetDishById(id!, {
    enabled: !!id
  })

  const updateDishMutation = useUpdateDish()

  // 編集モードに入る
  const handleEditClick = () => {
    setIsEditing(true)
    setEditedDish({
      nameJa: dish?.nameJa || dish?.name || "",
      nameEn: dish?.nameEn || "",
      price: dish?.price || 0,
      img: dish?.img || dish?.image || ""
    })
  }

  // 編集をキャンセル
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedDish({})
  }

  // 変更を保存
  const handleSave = async () => {
    if (!id || !dish) return

    try {
      await updateDishMutation.mutateAsync({
        id,
        dishData: editedDish
      })
      setIsEditing(false)
      setEditedDish({})
      refetch() // データを再取得
    } catch (error) {
      console.error("保存に失敗しました:", error)
    }
  }

  // 戻るボタン
  const handleGoBack = () => {
    navigate("/")
  }

  // フォーム値の変更
  const handleInputChange = (field: keyof Dish) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === "price" ? Number(event.target.value) : event.target.value
    setEditedDish(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          料理の詳細を取得できませんでした。
        </Alert>
        <Button
          variant="contained"
          onClick={handleGoBack}
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          戻る
        </Button>
      </Box>
    )
  }

  if (!dish) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          料理が見つかりませんでした。
        </Alert>
        <Button
          variant="contained"
          onClick={handleGoBack}
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          戻る
        </Button>
      </Box>
    )
  }

  const displayImage = dish.img || dish.image || "/placeholder-dish.svg"
  const displayName = dish.nameJa || dish.name || "名前なし"

  return (
    <Box p={3} maxWidth="800px" mx="auto">
      {/* ヘッダー */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={handleGoBack} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" flexGrow={1}>
          料理詳細
        </Typography>
        <Chip
          label={isEditing ? "編集中" : "閲覧中"}
          color={isEditing ? "warning" : "default"}
          variant="outlined"
        />
      </Stack>

      {/* エラー表示 */}
      {updateDishMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          更新に失敗しました。もう一度お試しください。
        </Alert>
      )}

      {/* メインコンテンツ */}
      <Paper elevation={3}>
        <Card>
          {/* 画像セクション */}
          <CardMedia
            component="img"
            height="300"
            image={isEditing ? editedDish.img || displayImage : displayImage}
            alt={displayName}
            sx={{
              objectFit: "cover",
              bgcolor: "grey.100"
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-dish.svg"
            }}
          />

          <CardContent>
            <Stack spacing={3}>
              {/* 料理名（日本語） */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  料理名（日本語）
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={editedDish.nameJa || ""}
                    onChange={handleInputChange("nameJa")}
                    placeholder="料理名を入力してください"
                    variant="outlined"
                  />
                ) : (
                  <Typography variant="h5" component="h2">
                    {displayName}
                  </Typography>
                )}
              </Box>

              {/* 料理名（英語） */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  料理名（英語）
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={editedDish.nameEn || ""}
                    onChange={handleInputChange("nameEn")}
                    placeholder="English name"
                    variant="outlined"
                  />
                ) : (
                  <Typography variant="h6" color="textSecondary">
                    {dish.nameEn || "未設定"}
                  </Typography>
                )}
              </Box>

              {/* 価格 */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  価格
                </Typography>
                {isEditing ? (
                  <TextField
                    type="number"
                    value={editedDish.price || ""}
                    onChange={handleInputChange("price")}
                    placeholder="価格を入力してください"
                    variant="outlined"
                    InputProps={{
                      endAdornment: <Typography color="textSecondary">円</Typography>
                    }}
                  />
                ) : (
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    ¥{dish.price?.toLocaleString() || "未設定"}
                  </Typography>
                )}
              </Box>

              {/* 画像URL */}
              {isEditing && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    画像URL
                  </Typography>
                  <TextField
                    fullWidth
                    value={editedDish.img || ""}
                    onChange={handleInputChange("img")}
                    placeholder="画像URLを入力してください"
                    variant="outlined"
                  />
                </Box>
              )}

              {/* アクションボタン */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      startIcon={<CancelIcon />}
                      disabled={updateDishMutation.isPending}
                    >
                      キャンセル
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      startIcon={<SaveIcon />}
                      disabled={updateDishMutation.isPending}
                    >
                      {updateDishMutation.isPending ? "保存中..." : "保存"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleEditClick}
                    startIcon={<EditIcon />}
                  >
                    編集
                  </Button>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  )
}

export default DishDetailPage
