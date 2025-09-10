import HTTP from "../BackendApis"

export const MockSubmission=async(attemptId:string, userId:string|undefined)=>{
    const res=await HTTP.put(`test_attempt_question/submitted/${userId}/${attemptId}`)
    return res.data;
}