import HTTP from "../BackendApis";

export const getAvatar = async (userId: string | undefined) => {
  if (!userId) throw new Error("userId not found");

  try {
    const res = await HTTP.get(`/user-details/${userId}/avatar`, {
      responseType: "arraybuffer", // or "blob"
    });

    const blob = new Blob([res.data], { type: "image/jpeg" });
    return URL.createObjectURL(blob); 
  } catch (error: any) {
    throw new Error(error?.message || "Failed to fetch avatar");
  }
};
