import HTTP from "../BackendApis"



export const GetAttemptId=async(userId:string|undefined, testId:string|undefined)=>{
    const body ={
        userId:userId,
        testSchId:testId,
        
    // userId:"da1d4547-4d7e-4bf0-a80d-94c868e4ccb5",
    // testSchId:"6b434b70-27c2-46db-801a-ad2c49c0bc19"
}
    
    const res=await HTTP.post("/test-attempt/getAttemptId", body);
    return res.data;
}