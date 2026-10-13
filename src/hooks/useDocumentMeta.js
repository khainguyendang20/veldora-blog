import { useEffect } from "react";

const siteName = "Veldora Blog";

// Sets the tab title ("Post title | Veldora Blog") and the meta
// description for the current page, restoring the defaults on leave.
// Google renders JavaScript and reads both; social previews (Open Graph)
// would need server rendering, since their crawlers don't run JavaScript.
export default function useDocumentMeta({ title, description } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | ${siteName}` : siteName;
    const meta = document.querySelector('meta[name="description"]');
    const previous = meta?.getAttribute("content");
    if (meta && description) meta.setAttribute("content", description);
    return () => {
      document.title = siteName;
      if (meta && previous != null) meta.setAttribute("content", previous);
    };
  }, [title, description]);
}
