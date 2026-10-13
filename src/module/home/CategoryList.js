import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import { collection, query, where } from "firebase/firestore";
import useCachedQuery from "hooks/useCachedQuery";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { categoryStatus } from "utils/constants";

const CategoryListStyles = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
  a {
    display: block;
    padding: 8px 12px;
    border-radius: 6px;
  }
  a:hover {
    background: ${(props) => props.theme.gray1};
  }
`;

// Sidebar links to every approved category
const CategoryList = () => {
  const { data: categories } = useCachedQuery(
    "categories:approved",
    () =>
      query(
        collection(db, "categories"),
        where("status", "==", categoryStatus.APPROVED)
      ),
    []
  );
  if (!categories.length) return null;
  const sorted = [...categories].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", "vi")
  );
  return (
    <nav aria-label="Categories">
      <Heading>Categories</Heading>
      <CategoryListStyles>
        {sorted.map((category) => (
          <li key={category.id}>
            <Link to={`/category/${category.slug}`}>{category.name}</Link>
          </li>
        ))}
      </CategoryListStyles>
    </nav>
  );
};

export default CategoryList;
