import { useSelector } from "react-redux";
import {type RootState } from "../store";
import { AuthenticationConstants } from "./AuthenticationConstants";

export const IsAuthenticated = () => {
  const accessToken = useSelector((state: RootState) => state?.user?.user?.accessToken);
  const role = useSelector((state: RootState) => state.user.user?.role);
  if (accessToken) {
    if (role === "ADMIN") {
      return AuthenticationConstants.admin;
    } else if (role === "USER") {
      return AuthenticationConstants.user;
    } else if (role === "ROLE_SYS_ADMIN") {
      return AuthenticationConstants.superAdmin;
    }
  } else {
    return AuthenticationConstants.deny;
  }
};
