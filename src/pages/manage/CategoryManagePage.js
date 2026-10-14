import { ActionDelete, ActionEdit, ActionView } from "components/actions";
import { Button } from "components/button";
import { Toggle } from "components/checkbox";
import { PageHeader, SearchInput } from "components/admin";
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
} from "firebase/firestore";
import debounce from "lodash/debounce";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { itemPerPage } from "utils/constants";

const CategoryManagePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("");
  const [lastDocs, setLastDocs] = useState();
  const [allCategories, setAllCategories] = useState([]);

  const handleFilterChange = useMemo(
    () => debounce((e) => setFilter(e.target.value), 500),
    []
  );
  // Later pages are a one-off read; only the first page stays live.
  const handleLoadMore = async () => {
    const nextRef = query(
      collection(db, "categories"),
      startAfter(lastDocs),
      limit(itemPerPage.MANAGE)
    );
    const snapshot = await getDocs(nextRef);
    const result = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCategories((prev) => [...prev, ...result]);
    setLastDocs(snapshot.docs[snapshot.docs.length - 1]);
  };
  // The whole collection is already loaded for the total, so search it in
  // memory: Firestore has no case-insensitive or substring queries
  const searchTerm = filter.trim().toLowerCase();
  const visibleCategories = searchTerm
    ? allCategories.filter(
        (category) =>
          category.name?.toLowerCase().includes(searchTerm) ||
          category.slug?.toLowerCase().includes(searchTerm)
      )
    : categories;
  useEffect(() => {
    const colRef = collection(db, "categories");
    const unsubscribeTotal = onSnapshot(colRef, (snapshot) =>
      setAllCategories(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
    const firstPage = query(colRef, limit(itemPerPage.MANAGE));
    const unsubscribeList = onSnapshot(firstPage, (snapshot) => {
      const result = [];
      snapshot.forEach((doc) => {
        result.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setCategories(result);
      setLastDocs(snapshot.docs[snapshot.docs.length - 1]);
    });
    return () => {
      unsubscribeTotal();
      unsubscribeList();
    };
  }, []);
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

  return (
    <>
      <PageHeader title="Categories" description="Group posts by topic.">
        <SearchInput
          aria-label="Search categories"
          onChange={handleFilterChange}
        />
        <Button size="md" href="/manage/add-category">
          New category
        </Button>
      </PageHeader>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Approved</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {!visibleCategories.length && (
            <tr>
              <td colSpan={4} className="table-empty">
                No categories found.
              </td>
            </tr>
          )}
          {visibleCategories.length > 0 &&
            visibleCategories.map((category) => (
              <tr key={category.id}>
                <td>
                  <strong>{category.name}</strong>
                </td>
                <td style={{ color: "var(--color-muted)" }}>{category.slug}</td>
                <td>
                  <Toggle
                    on={category.status === 1}
                    value={category.status}
                    onClick={() => handleApproveToggle(category)}
                  ></Toggle>
                </td>
                <td>
                  <div className="table-actions">
                    <ActionView
                      label="View on the blog"
                      onClick={() => navigate(`/category/${category.slug}`)}
                    ></ActionView>
                    <ActionEdit
                      onClick={() =>
                        navigate(`/manage/edit-category?id=${category.id}`)
                      }
                    ></ActionEdit>
                    <ActionDelete
                      onClick={() => handleDeleteCategory(category.id)}
                    ></ActionDelete>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      {!searchTerm && categories.length < allCategories.length && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <Button size="md" variant="secondary" onClick={handleLoadMore}>
            Load more
          </Button>
        </div>
      )}
    </>
  );
};

export default CategoryManagePage;
