import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import FormContainer from "layout/FormContainer";
import CategoryForm from "module/category/CategoryForm";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const EditCategoryPage = () => {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [category, setCategory] = useState(null);

  useEffect(() => {
    async function fetchCategory() {
      if (!id) return;
      const snapshot = await getDoc(doc(db, "categories", id));
      if (snapshot.data()) setCategory(snapshot.data());
    }
    fetchCategory();
  }, [id]);

  const handleUpdateCategory = async (payload) => {
    await updateDoc(doc(db, "categories", id), payload);
    toast.success("Update category successfully!");
  };

  return (
    <FormContainer>
      <Heading>Edit category</Heading>
      {category && (
        <CategoryForm
          key={id}
          defaultValues={category}
          onSubmit={handleUpdateCategory}
          submitLabel="Update"
        ></CategoryForm>
      )}
    </FormContainer>
  );
};

export default EditCategoryPage;
