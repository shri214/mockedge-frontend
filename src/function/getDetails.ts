import HTTP from "../BackendApis";

export const getDetailsMock = async (
  userId: string | undefined,
  testId: string
) => {
  const res = await HTTP.post(
    `test_attempt_question/getDetails-mock/${userId}/testId/${testId}`
  );
  return res.data;
};
