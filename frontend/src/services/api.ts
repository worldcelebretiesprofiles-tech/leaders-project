export const getBaseUrl = () => {
  let url = (import.meta.env.VITE_API_URL as string) || "";
  url = url.replace(/\/+$/, "");
  return url;
};

export const resolveImageUrl = (imgObj: any): string | undefined => {
  if (!imgObj) return undefined;
  let url = typeof imgObj === "string" ? imgObj : imgObj.secure_url;
  if (!url) return undefined;
  if (url.startsWith("/uploads/")) {
    let base = getBaseUrl();
    if (base.endsWith("/api/v1")) {
      base = base.substring(0, base.length - 7);
    }
    return `${base}${url}`;
  }
  return url;
};

let activeClientToken: string | null = null;

export const setClientToken = (token: string | null) => {
  activeClientToken = token;
};

export const getHeaders = (extraHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = { ...extraHeaders };
  if (typeof window !== "undefined") {
    const isAdminPath = window.location.pathname.startsWith("/admin");
    const token = isAdminPath ? sessionStorage.getItem("admin_token") : (activeClientToken || sessionStorage.getItem("client_token"));
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};



export async function getProfiles(filters?: { category_id?: number; subcategory_id?: number }) {
  let url = `${getBaseUrl()}/profiles`;
  const params = new URLSearchParams();
  if (filters?.category_id) {
    params.append("category_id", filters.category_id.toString());
  }
  if (filters?.subcategory_id) {
    params.append("subcategory_id", filters.subcategory_id.toString());
  }
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  const res = await fetch(url, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error("401 Unauthorized");
    throw new Error("Failed to fetch profiles from API");
  }
  return res.json();
}

export async function getProfileBySlug(slug: string, preview?: boolean) {
  const url = preview 
    ? `${getBaseUrl()}/profiles/${slug}?preview=true`
    : `${getBaseUrl()}/profiles/${slug}`;
  const res = await fetch(url, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch profile for slug '${slug}'`);
  }
  return res.json();
}


export async function saveProfile(profile: any) {
  const res = await fetch(`${getBaseUrl()}/profiles`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to save profile via API");
  }
  return res.json();
}

export async function publishProfile(id: number) {
  const res = await fetch(`${getBaseUrl()}/profiles/${id}/publish`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to publish profile via API");
  }
  return res.json();
}

export async function deleteProfile(id: number) {
  const res = await fetch(`${getBaseUrl()}/profiles/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete profile via API");
  return res.json();
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${getBaseUrl()}/upload`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to upload image via API");
  }
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${getBaseUrl()}/categories`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error("401 Unauthorized");
    throw new Error("Failed to fetch categories from API");
  }
  return res.json();
}

export async function saveCategory(category: any) {
  const res = await fetch(`${getBaseUrl()}/categories`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error("Failed to save category via API");
  return res.json();
}

export async function deleteCategory(id: number) {
  const res = await fetch(`${getBaseUrl()}/categories/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete category via API");
  return res.json();
}

export async function saveSubcategory(subcategory: any) {
  const res = await fetch(`${getBaseUrl()}/subcategories`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(subcategory),
  });
  if (!res.ok) throw new Error("Failed to save subcategory via API");
  return res.json();
}

export async function deleteSubcategory(id: number) {
  const res = await fetch(`${getBaseUrl()}/subcategories/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete subcategory via API");
  return res.json();
}

export async function getProfessionalExpertise(profileId: number) {
  const res = await fetch(`${getBaseUrl()}/profiles/${profileId}/professional-expertise`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch professional expertise");
  return res.json();
}

export async function saveProfessionalExpertise(profileId: number, expertiseData: any) {
  const res = await fetch(`${getBaseUrl()}/profiles/${profileId}/professional-expertise`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(expertiseData),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to save professional expertise");
  }
  return res.json();
}

export async function getFamilyDetails(profileId: number) {
  const res = await fetch(`${getBaseUrl()}/profiles/${profileId}/family`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch family details");
  return res.json();
}

export async function saveFamilyDetails(profileId: number, familyData: any) {
  const res = await fetch(`${getBaseUrl()}/profiles/${profileId}/family`, {
    method: "POST",
    headers: getHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(familyData),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to save family details");
  }
  return res.json();
}

export async function getMyNotifications() {
  const res = await fetch(`${getBaseUrl()}/notifications/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function markNotificationAsRead(id: number) {
  const res = await fetch(`${getBaseUrl()}/notifications/me/${id}/read`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
  return res.json();
}

export async function markAllNotificationsAsRead() {
  const res = await fetch(`${getBaseUrl()}/notifications/me/read-all`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark all notifications as read");
  return res.json();
}

export async function getMeCompletion() {
  const res = await fetch(`${getBaseUrl()}/profiles/me/completion`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch profile completion");
  return res.json();
}


export async function submitApplication(data: any) {
  const res = await fetch(`${getBaseUrl()}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to submit application");
  }
  return res.json();
}

export async function getDashboardAnalytics() {
  const res = await fetch(`${getBaseUrl()}/analytics`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard analytics");
  const data = await res.json();
  return data.data || data;
}

export async function rollbackVersion(profileId: number, versionId: number) {
  const res = await fetch(`${getBaseUrl()}/profiles/${profileId}/versions/${versionId}/rollback`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
  });
  if (!res.ok) throw new Error("Failed to rollback version");
  return res.json();
}

