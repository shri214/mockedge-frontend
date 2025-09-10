import HTTP from "../BackendApis"


export const getAttemptsByUser=async(userId:string|undefined)=>{
    const res=await HTTP.get(`/test-attempt/user/${userId}`);
    return res.data;
}

// test-attempt/user/da1d4547-4d7e-4bf0-a80d-94c868e4ccb5