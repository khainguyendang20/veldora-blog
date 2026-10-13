import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import HomeSection from "module/home/HomeSection";
import PostList from "module/post/PostList";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { postStatus } from "utils/constants";
import { normalizeText } from "utils/normalizeText";

// Firestore has no full-text search, so the newest approved posts are read
// once and filtered in the browser. Enough for a small blog; a search
// service (e.g. Algolia) is the next step if this grows.
const searchPoolSize = 200;

const SearchFormStyles = styled.form`
  margin-bottom: 32px;
  input {
    width: 100%;
    max-width: 480px;
    padding: 12px 16px;
    border: 1px solid ${(props) => props.theme.grayLight};
    border-radius: 8px;
    font-size: 16px;
  }
`;

const matchesSearch = (post, terms) => {
  const haystack = normalizeText(
    [
      post.title,
      post.desc,
      post.user?.fullname,
      ...(post.categories || []).map((category) => category.name),
    ].join(" ")
  );
  return terms.every((term) => haystack.includes(term));
};

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const searchQuery = params.get("q") || "";
  const [input, setInput] = useState(searchQuery);
  const [state, setState] = useState({ posts: [], loading: true, error: null });

  useEffect(() => setInput(searchQuery), [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    getDocs(
      query(
        collection(db, "posts"),
        where("status", "==", postStatus.APPROVED),
        orderBy("createdAt", "desc"),
        limit(searchPoolSize)
      )
    )
      .then((snapshot) => {
        if (cancelled) return;
        const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setState({ posts, loading: false, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setState({ posts: [], loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const terms = normalizeText(searchQuery).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return state.posts.filter((post) => matchesSearch(post, terms));
  }, [state.posts, searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = input.trim();
    setParams(q ? { q } : {});
  };

  return (
    <HomeSection>
      <Heading>{searchQuery ? `Results for "${searchQuery}"` : "Search"}</Heading>
      <SearchFormStyles role="search" onSubmit={handleSubmit}>
        <input
          type="search"
          aria-label="Search posts"
          placeholder="Search posts..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </SearchFormStyles>
      {searchQuery && (
        <PostList
          posts={results}
          loading={state.loading}
          error={state.error}
          emptyText="No posts match your search."
        ></PostList>
      )}
    </HomeSection>
  );
};

export default SearchPage;
