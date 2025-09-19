import HTTP from "../BackendApis";
import type { IChangePassInfo } from "../Interface";

export const changePassUser = async (passInfo: IChangePassInfo) => {
  try {
    const res = await HTTP.post("/user/change-password", passInfo);

    if (!res.data) {
      throw new Error("No data received from server");
    }

    return res.data;
  } catch (error) {
    console.error("Error fetching test scheduled analytics:", error);
    throw error;
  }
};
