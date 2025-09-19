import HTTP from "../BackendApis";

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await HTTP.post(`/user-details/upload-avatar/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.message;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to upload avatar');
  }
};