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

export const itemPerPage = {
  MANAGE: 1,
};

export const avatarDefault =
  "https://firebasestorage.googleapis.com/v0/b/fspade-blog.appspot.com/o/images%2Fdf73e305fe485d09902e8321f060cc93.jpg?alt=media&token=df8b48a7-520c-4963-a39a-f46e1efb1093";

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
