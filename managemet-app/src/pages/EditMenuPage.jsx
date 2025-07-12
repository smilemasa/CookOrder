import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useGetDishById, useUpdateDish } from "../api"
import MenuForm from "../components/MenuForm"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"

function EditMenuPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [submitError, setSubmitError] = useState(null)

  // 料理データを取得
  const {
    data: currentMenu,
    isLoading: loading,
    error,
  } = useGetDishById(id)

  // 料理更新のmutation
  const updateDishMutation = useUpdateDish()

  const handleSubmit = async (menuData) => {
    try {
      setSubmitError(null)
      await updateDishMutation.mutateAsync({ id, dishData: menuData })
      navigate("/manage")
    } catch (err) {
      setSubmitError("メニューの更新に失敗しました。")
    }
  }

  const handleCancel = () => {
    navigate("/manage")
  }

  if (!currentMenu && menus.length > 0) {
    return (
      <div className="edit-menu-page">
        <ErrorMessage message="指定されたメニューが見つかりません。" />
      </div>
    )
  }

  if (!currentMenu) {
    return <LoadingSpinner />
  }

  return (
    <div className="edit-menu-page">
      <div className="page-header">
        <h1>✏️ メニューを編集</h1>
        <p>
          「{currentMenu.nameJa || currentMenu.name}」の情報を編集してください
        </p>
      </div>

      {(error || submitError) && (
        <ErrorMessage message={error || submitError} />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <MenuForm
          initialData={currentMenu}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitText="変更を保存"
          loading={loading}
        />
      )}
    </div>
  )
}

export default EditMenuPage
