import {
    ArrowBack as ArrowBackIcon,
    Cancel as CancelIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    PhotoCamera as PhotoCameraIcon,
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Input,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material"
import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDeleteDish, useGetDishById, useUpdateDish } from "../api/hooks"
import { DishUpdateRequest } from "../api/services"

const DishDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editedDish, setEditedDish] = useState<DishUpdateRequest>({})
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    data: dish,
    isLoading,
    error,
    refetch
  } = useGetDishById(id!, {
    enabled: !!id
  })

  const updateDishMutation = useUpdateDish()
  const deleteDishMutation = useDeleteDish()

  // 削除確認ダイアログを開く
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  // 削除確認ダイアログを閉じる
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  // 削除を実行
  const handleDeleteConfirm = async () => {
    if (!id) return

    try {
      await deleteDishMutation.mutateAsync(id)
      setDeleteDialogOpen(false)
      navigate("/") // 削除後は一覧ページに戻る
    } catch (error) {
      console.error("削除に失敗しました:", error)
    }
  }

  // 編集モードに入る
  // 編集モードに入る
  const handleEditClick = () => {
    setIsEditing(true)
    setEditedDish({
      nameJa: dish?.nameJa || "",
      nameEn: dish?.nameEn || "",
      price: dish?.price || 0
    })
  }

  // 編集をキャンセル
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedDish({})
    setSelectedImageFile(null)
    setImagePreview(null)
  }

  // ファイル選択ハンドラー
  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（5MBまで）
      if (file.size > 5 * 1024 * 1024) {
        alert("ファイルサイズは5MB以下にしてください")
        return
      }

      // ファイル形式チェック
      if (!file.type.startsWith('image/')) {
        alert("画像ファイルを選択してください")
        return
      }

      setSelectedImageFile(file)

      // プレビュー用のDataURLを作成
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        // ファイルをeditedDishに設定
        setEditedDish(prev => ({
          ...prev,
          photo: file
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // 画像削除ハンドラー
  const handleImageDelete = () => {
    setSelectedImageFile(null)
    setImagePreview(null)
    setEditedDish(prev => {
      const { photo, ...rest } = prev
      return rest
    })
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
      setSelectedImageFile(null)
      setImagePreview(null)
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
  const handleInputChange = (field: keyof DishUpdateRequest) => (
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

  const displayImage = dish.img || "/placeholder-dish.svg"
  const displayName = dish.nameJa || "名前なし"

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

      {deleteDishMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          削除に失敗しました。もう一度お試しください。
        </Alert>
      )}

      {/* メインコンテンツ */}
      <Paper elevation={3}>
        <Card>
          {/* 画像セクション */}
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="300"
              image={isEditing ? (imagePreview || displayImage) : displayImage}
              alt={displayName}
              sx={{
                objectFit: "cover",
                bgcolor: "grey.100"
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-dish.svg"
              }}
            />

            {/* 編集モード時の画像コントロール */}
            {isEditing && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  display: 'flex',
                  gap: 1
                }}
              >
                <Input
                  type="file"
                  inputProps={{
                    accept: "image/*",
                    id: "image-upload"
                  }}
                  onChange={handleImageFileSelect}
                  sx={{ display: 'none' }}
                />
                <label htmlFor="image-upload">
                  <IconButton
                    component="span"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark'
                      }
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </label>

                {(imagePreview || selectedImageFile) && (
                  <IconButton
                    onClick={handleImageDelete}
                    sx={{
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'error.dark'
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>

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

              {/* アクションボタン */}
              <Stack direction="row" spacing={2} justifyContent="space-between">
                {/* 削除ボタン（編集モードでない時のみ表示） */}
                {!isEditing && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteClick}
                    startIcon={<DeleteIcon />}
                    disabled={deleteDishMutation.isPending}
                  >
                    削除
                  </Button>
                )}

                {/* 編集・保存ボタン */}
                <Stack direction="row" spacing={2}>
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
            </Stack>
          </CardContent>
        </Card>
      </Paper>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          料理の削除
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            「{dish?.nameJa}」を削除しますか？
            <br />
            この操作は取り消すことができません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleteDishMutation.isPending}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteDishMutation.isPending}
            startIcon={<DeleteIcon />}
          >
            {deleteDishMutation.isPending ? "削除中..." : "削除"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DishDetailPage
