import { PageHeader } from "components/admin";
import { db } from "config/firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import FormContainer from "layout/FormContainer";
import CategoryForm from "module/category/CategoryForm";
import React from "react";
import { toast } from "react-toastify";

const AddNewCategoryPage = () => {
  const handleCreateCategory = async (payload) => {
    await addDoc(collection(db, "categories"), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    toast.success("Create new category successfully!");
  };

  return (
    <>
      <PageHeader
        title="New category"
        description="Categories group posts on the blog and in search."
      ></PageHeader>
      <FormContainer>
        <CategoryForm
          onSubmit={handleCreateCategory}
          submitLabel="Create"
          resetAfterSubmit
        ></CategoryForm>
      </FormContainer>
    </>
  );
};

export default AddNewCategoryPage;
