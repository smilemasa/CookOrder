import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';
import MenuForm from '../components/MenuForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function EditMenuPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { menus, getMenuById, updateMenu, loading, error } = useMenu();
  const [currentMenu, setCurrentMenu] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        // まずローカルのmenusから検索
        const localMenu = menus.find(m => m.id === id || m.id === parseInt(id));
        if (localMenu) {
          setCurrentMenu(localMenu);
        } else if (getMenuById) {
          // APIから取得を試行
          const menu = await getMenuById(id);
          setCurrentMenu(menu);
        } else if (menus.length > 0) {
          // メニューが見つからない場合は管理画面に戻る
          navigate('/manage');
        }
      } catch (err) {
        console.error('メニューの取得に失敗:', err);
        navigate('/manage');
      }
    };

    if (id) {
      loadMenu();
    }
  }, [id, menus, getMenuById, navigate]);

  const handleSubmit = async (menuData) => {
    try {
      setSubmitError(null);
      await updateMenu(id, menuData);
      navigate('/manage');
    } catch (err) {
      setSubmitError('メニューの更新に失敗しました。');
    }
  };

  const handleCancel = () => {
    navigate('/manage');
  };

  if (!currentMenu && menus.length > 0) {
    return (
      <div className="edit-menu-page">
        <ErrorMessage message="指定されたメニューが見つかりません。" />
      </div>
    );
  }

  if (!currentMenu) {
    return <LoadingSpinner />;
  }

  return (
    <div className="edit-menu-page">
      <div className="page-header">
        <h1>✏️ メニューを編集</h1>
        <p>「{currentMenu.nameJa || currentMenu.name}」の情報を編集してください</p>
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
  );
}

export default EditMenuPage;
