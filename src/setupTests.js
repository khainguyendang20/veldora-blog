import "@testing-library/jest-dom";

// useCachedQuery remembers fetch times in localStorage; start each test clean
beforeEach(() => localStorage.clear());
