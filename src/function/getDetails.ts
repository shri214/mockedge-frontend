import { toast } from "react-toastify";
import HTTP from "../BackendApis";

export const getDetailsMock = async (
  userId: string | undefined,
  testId: string
) => {
  try {
    const res = await HTTP.post(
      `test_attempt_question/getDetails-mock/${userId}/testId/${testId}`
    );
    if (!res.data) {
      throw new Error("details not found");
    }
    return res.data;
  } catch (error: any) {
    toast.error(error);
  }
};
