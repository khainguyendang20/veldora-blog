import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "pages/HomePage";
import NotFoundPage from "pages/NotFoundPage";
import LayoutDashboard from "layout/LayoutDashboard";
import useAuthListener from "hooks/useAuthListener";
import RequireRole from "layout/RequireRole";
import { userRole } from "utils/constants";
import Layout from "components/layout/Layout";

// Everything except the home page is split into its own chunk, so readers
// never download the editor, form libraries or admin tables.
const LoginPage = lazy(() => import("pages/LoginPage"));
const RegisterPage = lazy(() => import("pages/RegisterPage"));
const PostDetailPage = lazy(() => import("pages/PostDetailPage"));
const ProfilePage = lazy(() => import("pages/ProfilePage"));
const DashboardPage = lazy(() => import("pages/manage/DashboardPage"));
const AddNewPostPage = lazy(() => import("pages/manage/AddNewPostPage"));
const UpdatePostPage = lazy(() => import("pages/manage/UpdatePostPage"));
const PostManagePage = lazy(() => import("pages/manage/PostManagePage"));
const AddNewCategoryPage = lazy(() =>
  import("pages/manage/AddNewCategoryPage")
);
const EditCategoryPage = lazy(() => import("pages/manage/EditCategoryPage"));
const CategoryManagePage = lazy(() =>
  import("pages/manage/CategoryManagePage")
);
const UserManagePage = lazy(() => import("pages/manage/UserManagePage"));

function App() {
  useAuthListener();
  return (
    <Suspense fallback={null}>
      <AppRoutes />
    </Suspense>
  );
}

function AppRoutes() {
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
          element={<RequireRole roles={[userRole.ADMIN, userRole.MOD]} />}
        >
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
        </Route>
        <Route element={<RequireRole roles={[userRole.ADMIN]} />}>
          <Route
            path="/manage/user"
            element={<UserManagePage></UserManagePage>}
          ></Route>
        </Route>
        <Route
          path="/manage/post"
          element={<PostManagePage></PostManagePage>}
        ></Route>
      </Route>
    </Routes>
  );
}

export default App;
