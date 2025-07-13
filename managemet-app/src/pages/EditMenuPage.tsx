import React from "react"
// import { useNavigate, useParams } from "react-router-dom"
import { useGetDishById } from "../api"
// import MenuForm from "../components/MenuForm"
// import LoadingSpinner from "../components/LoadingSpinner"
// import ErrorMessage from "../components/ErrorMessage"

const EditMenuPage: React.FC = () => {
  // const navigate = useNavigate()
  // const { id } = useParams()
  // const [submitError, setSubmitError] = useState<string | null>(null)

  // 料理データを取得
  const {
    data: currentMenu,
    isLoading: loading,
    error,
  } = useGetDishById("1") // 暫定的にID "1" を使用

  // 料理更新のmutation
  // const updateDishMutation = useUpdateDish()

  // const handleSubmit = async (menuData: any) => {
  //   try {
  //     setSubmitError(null)
  //     await updateDishMutation.mutateAsync({ id: "1", dishData: menuData })
  //     // navigate("/manage")
  //   } catch (err) {
  //     setSubmitError("メニューの更新に失敗しました。")
  //   }
  // }

  // const handleCancel = () => {
  //   // navigate("/manage")
  // }

  if (!currentMenu) {
    return (
      <div className="edit-menu-page">
        <div>指定されたメニューが見つかりません。</div>
      </div>
    )
  }

  return (
    <div className="edit-menu-page">
      <div className="page-header">
        <h1>✏️ メニューを編集</h1>
        <p>
          「{currentMenu.nameJa}」の情報を編集してください
        </p>
      </div>

      {error && (
        <div>{String(error)}</div>
      )}

      {loading ? (
        <div>読み込み中...</div>
      ) : (
        <div>
          {/* MenuFormコンポーネントは一旦コメントアウト */}
          {/* <MenuForm
            initialData={currentMenu}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitText="変更を保存"
            loading={loading}
          /> */}
          <p>メニューフォームは準備中です</p>
        </div>
      )}
    </div>
  )
}

export default EditMenuPage
