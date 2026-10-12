import { Route, Routes } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "pages/LoginPage";
import HomePage from "pages/HomePage";
import NotFoundPage from "pages/NotFoundPage";
import LayoutDashboard from "layout/LayoutDashboard";
import AddNewPostPage from "pages/manage/AddNewPostPage";
import useAuthListener from "hooks/useAuthListener";
import AddNewCategoryPage from "pages/manage/AddNewCategoryPage";
import CategoryManagePage from "pages/manage/CategoryManagePage";
import EditCategoryPage from "pages/manage/EditCategoryPage";
import UserManagePage from "pages/manage/UserManagePage";
import ProfilePage from "pages/ProfilePage";
import PostManagePage from "pages/manage/PostManagePage";
import Layout from "components/layout/Layout";
import PostDetailPage from "pages/PostDetailPage";
import UpdatePostPage from "pages/manage/UpdatePostPage";
import DashboardPage from "pages/manage/DashboardPage";

function App() {
  useAuthListener();
  return (
    <Routes>
      <Route element={<Layout></Layout>}>
        <Route path="/" element={<HomePage></HomePage>}></Route>
        <Route
          path="/post/:slug"
          element={<PostDetailPage></PostDetailPage>}
        ></Route>
        <Route
          path="/profile/:username"
          element={<ProfilePage></ProfilePage>}
        ></Route>
        <Route path="*" element={<NotFoundPage></NotFoundPage>}></Route>
      </Route>
      <Route path="/register" element={<RegisterPage></RegisterPage>}></Route>
      <Route path="/login" element={<LoginPage></LoginPage>}></Route>
      <Route element={<LayoutDashboard></LayoutDashboard>}>
        <Route
          path="/manage/dashboard"
          element={<DashboardPage></DashboardPage>}
        ></Route>
        <Route
          path="/manage/add-post"
          element={<AddNewPostPage></AddNewPostPage>}
        ></Route>
        <Route
          path="/manage/update-post"
          element={<UpdatePostPage></UpdatePostPage>}
        ></Route>
        <Route
          path="/manage/add-category"
          element={<AddNewCategoryPage></AddNewCategoryPage>}
        ></Route>
        <Route
          path="/manage/category"
          element={<CategoryManagePage></CategoryManagePage>}
        ></Route>
        <Route
          path="/manage/edit-category"
          element={<EditCategoryPage></EditCategoryPage>}
        ></Route>
        <Route
          path="/manage/user"
          element={<UserManagePage></UserManagePage>}
        ></Route>
        <Route
          path="/manage/post"
          element={<PostManagePage></PostManagePage>}
        ></Route>
      </Route>
    </Routes>
  );
}

export default App;
