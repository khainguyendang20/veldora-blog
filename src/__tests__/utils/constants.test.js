import {
  theme,
  postStatus,
  categoryStatus,
  userRole,
  userStatus,
  getRoleName,
  getStatusName,
  avatarDefault,
  itemPerPage,
} from "utils/constants";

describe("constants", () => {
  describe("theme", () => {
    it("should have primary color", () => {
      expect(theme.primary).toBe("#2980b9");
    });

    it("should have secondary color", () => {
      expect(theme.secondary).toBe("#00b8ff");
    });

    it("should have headerHeight", () => {
      expect(theme.headerHeight).toBe("72px");
    });
  });

  describe("postStatus", () => {
    it("should have correct status values", () => {
      expect(postStatus.APPROVED).toBe(1);
      expect(postStatus.PENDING).toBe(2);
      expect(postStatus.REJECTED).toBe(3);
    });
  });

  describe("categoryStatus", () => {
    it("should have correct status values", () => {
      expect(categoryStatus.UNAPPROVED).toBe(0);
      expect(categoryStatus.APPROVED).toBe(1);
    });
  });

  describe("userRole", () => {
    it("should have correct role values", () => {
      expect(userRole.ADMIN).toBe(1);
      expect(userRole.MOD).toBe(2);
      expect(userRole.USER).toBe(3);
    });
  });

  describe("userStatus", () => {
    it("should have correct status values", () => {
      expect(userStatus.ACTIVE).toBe(1);
      expect(userStatus.PENDING).toBe(2);
      expect(userStatus.BANNED).toBe(3);
    });
  });

  describe("itemPerPage", () => {
    it("should have MANAGE value", () => {
      expect(itemPerPage.MANAGE).toBe(10);
    });
  });

  describe("avatarDefault", () => {
    // Served from public/ so it never depends on an external host
    it("should point to a local public asset", () => {
      expect(avatarDefault).toMatch(/^\/[\w-]+\.svg$/);
    });
  });
});

describe("getRoleName", () => {
  it('should return "Admin" for ADMIN role', () => {
    expect(getRoleName(userRole.ADMIN)).toBe("Admin");
  });

  it('should return "Moderator" for MOD role', () => {
    expect(getRoleName(userRole.MOD)).toBe("Moderator");
  });

  it('should return "User" for USER role', () => {
    expect(getRoleName(userRole.USER)).toBe("User");
  });

  it('should return "Unknown" for invalid role value', () => {
    expect(getRoleName(99)).toBe("Unknown");
    expect(getRoleName(undefined)).toBe("Unknown");
    expect(getRoleName(null)).toBe("Unknown");
  });
});

describe("getStatusName", () => {
  it('should return "Active" for ACTIVE status', () => {
    expect(getStatusName(userStatus.ACTIVE)).toBe("Active");
  });

  it('should return "Pending" for PENDING status', () => {
    expect(getStatusName(userStatus.PENDING)).toBe("Pending");
  });

  it('should return "Banned" for BANNED status', () => {
    expect(getStatusName(userStatus.BANNED)).toBe("Banned");
  });

  it('should return "Unknown" for invalid status value', () => {
    expect(getStatusName(0)).toBe("Unknown");
    expect(getStatusName(-1)).toBe("Unknown");
    expect(getStatusName(undefined)).toBe("Unknown");
  });
});
