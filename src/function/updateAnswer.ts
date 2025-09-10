import HTTP from "../BackendApis";

export const UpdateAnswer = async (
  attemptId: string,
  questionId: string,
  answer: string
) => {
  const res = await HTTP.put(
    `/test_attempt_question/${attemptId}/questions/${questionId}/answer`,
    answer,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );

  return res.data;
};

///test_attempt_question/"/{attemptId}/questions/{questionId}/answer"
