import {
    ArrowBack as ArrowBackIcon,
    Cancel as CancelIcon,
    Delete as DeleteIcon,
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
    IconButton,
    Input,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCreateDish } from "../api/hooks"
import { DishCreateRequest } from "../api/services"

const AddDishPage: React.FC = () => {
  const navigate = useNavigate()
  const [dishData, setDishData] = useState<Omit<DishCreateRequest, 'photo'>>({
    nameJa: "",
    nameEn: "",
    price: 0
  })
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const createDishMutation = useCreateDish()

  // 戻るボタン
  const handleGoBack = () => {
    navigate("/")
  }

  // フォーム値の変更
  const handleInputChange = (field: keyof Omit<DishCreateRequest, 'photo'>) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === "price" ? Number(event.target.value) : event.target.value
    setDishData(prev => ({
      ...prev,
      [field]: value
    }))
    // エラーをクリア
    setValidationErrors([])
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
      }
      reader.readAsDataURL(file)
    }
  }

  // 画像削除ハンドラー
  const handleImageDelete = () => {
    setSelectedImageFile(null)
    setImagePreview(null)
  }

  // バリデーション
  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!dishData.nameJa.trim()) {
      errors.push("料理名（日本語）は必須です")
    }

    if (!dishData.nameEn.trim()) {
      errors.push("料理名（英語）は必須です")
    }

    if (!dishData.price || dishData.price <= 0) {
      errors.push("価格は1円以上で入力してください")
    }

    if (!selectedImageFile) {
      errors.push("画像ファイルを選択してください")
    }

    return errors
  }

  // 保存処理
  const handleSave = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    if (!selectedImageFile) return

    try {
      const createData: DishCreateRequest = {
        ...dishData,
        photo: selectedImageFile
      }

      await createDishMutation.mutateAsync(createData)
      navigate("/") // 作成成功時は一覧ページに戻る
    } catch (error) {
      console.error("料理の作成に失敗しました:", error)
    }
  }

  // リセット処理
  const handleReset = () => {
    setDishData({
      nameJa: "",
      nameEn: "",
      price: 0
    })
    setSelectedImageFile(null)
    setImagePreview(null)
    setValidationErrors([])
  }

  return (
    <Box p={3} maxWidth="800px" mx="auto">
      {/* ヘッダー */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={handleGoBack} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" flexGrow={1}>
          新しい料理を追加
        </Typography>
      </Stack>

      {/* エラー表示 */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {createDishMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          料理の作成に失敗しました。もう一度お試しください。
        </Alert>
      )}

      {/* メインコンテンツ */}
      <Paper elevation={3}>
        <Card>
          {/* 画像セクション */}
          <Box sx={{ position: 'relative', height: 300, bgcolor: 'grey.100' }}>
            {imagePreview ? (
              <CardMedia
                component="img"
                height="300"
                image={imagePreview}
                alt="料理のプレビュー"
                sx={{ objectFit: "cover" }}
              />
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'grey.500'
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h6">画像を選択してください</Typography>
              </Box>
            )}

            {/* 画像コントロール */}
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

              {imagePreview && (
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
          </Box>

          <CardContent>
            <Stack spacing={3}>
              {/* 料理名（日本語） */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  料理名（日本語） *
                </Typography>
                <TextField
                  fullWidth
                  value={dishData.nameJa}
                  onChange={handleInputChange("nameJa")}
                  placeholder="料理名を入力してください"
                  variant="outlined"
                  required
                />
              </Box>

              {/* 料理名（英語） */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  料理名（英語） *
                </Typography>
                <TextField
                  fullWidth
                  value={dishData.nameEn}
                  onChange={handleInputChange("nameEn")}
                  placeholder="English name"
                  variant="outlined"
                  required
                />
              </Box>

              {/* 価格 */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  価格 *
                </Typography>
                <TextField
                  type="number"
                  value={dishData.price || ""}
                  onChange={handleInputChange("price")}
                  placeholder="価格を入力してください"
                  variant="outlined"
                  InputProps={{
                    endAdornment: <Typography color="textSecondary">円</Typography>
                  }}
                  inputProps={{ min: 1 }}
                  required
                />
              </Box>

              {/* ファイル情報 */}
              {selectedImageFile && (
                <Alert severity="info">
                  選択されたファイル: {selectedImageFile.name}
                  <br />
                  ファイルサイズ: {Math.round(selectedImageFile.size / 1024)} KB
                </Alert>
              )}

              {/* アクションボタン */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<CancelIcon />}
                  disabled={createDishMutation.isPending}
                >
                  リセット
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  startIcon={<SaveIcon />}
                  disabled={createDishMutation.isPending}
                >
                  {createDishMutation.isPending ? "作成中..." : "作成"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  )
}

export default AddDishPage
