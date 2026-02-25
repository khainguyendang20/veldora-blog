import { ActionDelete, ActionEdit, ActionView } from "components/actions";
import { Button } from "components/button";
import { Toggle } from "components/checkbox";
import { FieldCheckboxes } from "components/field";
import { IconSearch } from "components/icons";
import Heading from "components/layout/Heading";
import { Table } from "components/table";
import { db } from "config/firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { itemPerPage, userRole } from "utils/constants";
import { useAuthStore } from "store";

const CategoryManagePage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore((state) => state);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("");
  const [lastDocs, setLastDocs] = useState();
  const [total, setTotal] = useState(0);

  const handleFilterChange = debounce((e) => {
    setFilter(e.target.value);
  }, 500);
  const handleLoadMore = async () => {
    const nextRef = query(
      collection(db, "categories"),
      startAfter(lastDocs),
      limit(itemPerPage.MANAGE)
    );
    onSnapshot(nextRef, (snapshot) => {
      let result = [];
      snapshot.forEach((doc) => {
        result.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setCategories([...categories, ...result]);
    });
    const documentSnapshots = await getDocs(nextRef);
    const lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    setLastDocs(lastVisible);
  };
  useEffect(() => {
    const fetchData = async () => {
      const colRef = collection(db, "categories");
      onSnapshot(colRef, (snapshot) => setTotal(snapshot.size));
      const newRef = filter
        ? query(
            colRef,
            where("name", ">=", filter),
            where("name", "<=", filter + "utf8")
          )
        : query(colRef, limit(itemPerPage.MANAGE));
      const documentSnapshots = await getDocs(newRef);
      const lastVisible =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];
      onSnapshot(newRef, (snapshot) => {
        let result = [];
        snapshot.forEach((doc) => {
          result.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setCategories(result);
      });
      setLastDocs(lastVisible);
    };
    fetchData();
  }, [filter]);
  const handleApproveToggle = (data) => {
    const colRef = doc(db, "categories", data.id);
    updateDoc(colRef, {
      status: data.status === 1 ? 0 : 1,
    });
  };
  const handleDeleteCategory = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const colRef = doc(db, "categories", id);
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
        await deleteDoc(colRef);
      }
    });
  };

  // Only Admin and Mod can manage categories
  if (
    currentUser?.role !== userRole.ADMIN &&
    currentUser?.role !== userRole.MOD
  ) {
    return (
      <>
        <Heading>Access Denied</Heading>
        <p>You do not have permission to access this page.</p>
      </>
    );
  }

  return (
    <>
      <FieldCheckboxes>
        <Heading>Category Manage</Heading>
        <div
          className="search"
          style={{ marginBottom: "30px", marginLeft: "auto" }}
        >
          <input
            type="text"
            className="search-input"
            placeholder="Type to search... "
            onChange={handleFilterChange}
          />
          <span className="search-icon">
            <IconSearch></IconSearch>
          </span>
        </div>
      </FieldCheckboxes>
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Slug</th>
            <th>Approved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 &&
            categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.slug}</td>
                <td>
                  <Toggle
                    on={category.status === 1}
                    value={category.status}
                    onClick={() => handleApproveToggle(category)}
                  ></Toggle>
                </td>
                <td>
                  <FieldCheckboxes>
                    <ActionView></ActionView>
                    <ActionEdit
                      onClick={() =>
                        navigate(`/manage/edit-category?id=${category.id}`)
                      }
                    ></ActionEdit>
                    <ActionDelete
                      onClick={() => handleDeleteCategory(category.id)}
                    ></ActionDelete>
                  </FieldCheckboxes>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      {categories.length < total && (
        <Button onClick={handleLoadMore}>Load more</Button>
      )}
    </>
  );
};

export default CategoryManagePage;
