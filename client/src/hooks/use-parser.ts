import { useMutation } from "@tanstack/react-query";
import { api, type ParseGithubInput } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

// POST /api/parse/github
export function useParseGithub() {
  return useMutation({
    mutationFn: async (data: ParseGithubInput) => {
      const res = await apiRequest("POST", api.parse.github.path, data);
      return api.parse.github.responses[200].parse(await res.json());
    },
  });
}

// POST /api/parse/excel
// Note: This requires FormData, so we handle the fetch manually instead of using apiRequest helper which assumes JSON
export function useParseExcel() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.parse.excel.path, {
        method: api.parse.excel.method,
        body: formData,
        // Don't set Content-Type header manually, let browser set boundary
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to parse Excel file");
      }

      return api.parse.excel.responses[200].parse(await res.json());
    },
  });
}
