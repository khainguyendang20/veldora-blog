export const theme = {
  primary: "#2980b9",
  secondary: "#00b8ff",
  tertiary: "#0000fe",
  grayLight: "#E7ECF3",
  grayDark: "#292D32",
  headerHeight: "72px",
  gray1: "#ecf0f1",
};

export const postStatus = {
  APPROVED: 1,
  PENDING: 2,
  REJECTED: 3,
};

export const categoryStatus = {
  UNAPPROVED: 0,
  APPROVED: 1,
};

// Category ids featured as sections on the home page
export const homeCategory = {
  TECHNOLOGY: "IOLi8j3f97GwzD06PGzd",
};

export const itemPerPage = {
  MANAGE: 1,
};

export const avatarDefault = "/avatar-default.svg";

export const thumbnailPlaceholder = "/thumbnail-placeholder.svg";

export const userRole = {
  ADMIN: 1,
  MOD: 2,
  USER: 3,
};

export const userStatus = {
  ACTIVE: 1,
  PENDING: 2,
  BANNED: 3,
};

export const getRoleName = (roleValue) => {
  switch (roleValue) {
    case userRole.ADMIN:
      return "Admin";
    case userRole.MOD:
      return "Moderator";
    case userRole.USER:
      return "User";
    default:
      return "Unknown";
  }
};

export const getStatusName = (statusValue) => {
  switch (statusValue) {
    case userStatus.ACTIVE:
      return "Active";
    case userStatus.PENDING:
      return "Pending";
    case userStatus.BANNED:
      return "Banned";
    default:
      return "Unknown";
  }
};
