import HTTP from "../BackendApis";

export const reScheduled = async (
  userId: string,
  testId: string,
  date: string
) => {
  const body = { date };
  const res = await HTTP.put(
    `/test-scheduled/reschedule/${userId}/${testId}`,
    body
  );
  return res.data;
};
