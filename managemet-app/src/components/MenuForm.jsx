import React, { useState, useEffect } from "react"
import { useMenu } from "../context/MenuContext"
import "./MenuForm.css"

function MenuForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitText,
  loading = false,
}) {
  const { categories } = useMenu()
  const [formData, setFormData] = useState({
    nameJa: "",
    nameEn: "",
    price: "",
    img: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        nameJa: initialData.nameJa || initialData.name || "",
        nameEn: initialData.nameEn || "",
        price: initialData.price || "",
        img: initialData.img || initialData.image || "",
      })
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nameJa.trim()) {
      newErrors.nameJa = "日本語名は必須です"
    }

    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "有効な価格を入力してください"
    }

    if (formData.img && !isValidImageUrl(formData.img)) {
      newErrors.img = "有効な画像URLを入力してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidImageUrl = (url) => {
    try {
      new URL(url)
      return (
        /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes("unsplash.com")
      )
    } catch {
      return false
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // エラーをクリア
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      const submissionData = {
        id: initialData?.id,
        nameJa: formData.nameJa,
        nameEn: formData.nameEn,
        price: parseInt(formData.price),
        img: formData.img || "/placeholder-food.jpg",
      }
      onSubmit(submissionData)
    }
  }

  return (
    <div className="menu-form-container">
      <form onSubmit={handleSubmit} className="menu-form">
        <div className="form-group">
          <label htmlFor="nameJa">日本語名 *</label>
          <input
            type="text"
            id="nameJa"
            name="nameJa"
            value={formData.nameJa}
            onChange={handleChange}
            className={errors.nameJa ? "error" : ""}
            placeholder="例: 特製ラーメン"
          />
          {errors.nameJa && (
            <span className="error-message">{errors.nameJa}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="nameEn">英語名</label>
          <input
            type="text"
            id="nameEn"
            name="nameEn"
            value={formData.nameEn}
            onChange={handleChange}
            className={errors.nameEn ? "error" : ""}
            placeholder="例: Special Ramen"
          />
          {errors.nameEn && (
            <span className="error-message">{errors.nameEn}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="price">価格 (円) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={errors.price ? "error" : ""}
            placeholder="例: 890"
            min="0"
          />
          {errors.price && (
            <span className="error-message">{errors.price}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="img">画像URL</label>
          <input
            type="url"
            id="img"
            name="img"
            value={formData.img}
            onChange={handleChange}
            className={errors.img ? "error" : ""}
            placeholder="例: https://images.unsplash.com/photo-..."
          />
          {errors.img && <span className="error-message">{errors.img}</span>}
          <small className="form-help">
            画像URLを入力するか、空欄にしてデフォルト画像を使用できます
          </small>
        </div>

        {formData.img && (
          <div className="image-preview">
            <label>画像プレビュー</label>
            <img
              src={formData.img}
              alt="プレビュー"
              onError={(e) => {
                e.target.style.display = "none"
              }}
              onLoad={(e) => {
                e.target.style.display = "block"
              }}
            />
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            キャンセル
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "保存中..." : submitText}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MenuForm
