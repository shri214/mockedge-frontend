import HTTP from "../BackendApis";

export const testScheduledAnalytic = async (userId: string | undefined) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  try {
    const res = await HTTP.post(`/analytics/testScheduled/${userId}`);
    
    if (!res.data) {
      throw new Error("No data received from server");
    }
    
    return res.data;
  } catch (error) {
    console.error("Error fetching test scheduled analytics:", error);
    throw error;
  }
};
