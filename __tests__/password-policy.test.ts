import { passwordSchema } from "@/lib/auth/password";

describe("password policy", () => {
  it("accepts a sufficiently strong password", () => {
    expect(passwordSchema.safeParse("Valid8Aa").success).toBe(true);
  });

  it.each(["short7A", "alllowercase123", "ALLUPPERCASE123", "NoNumbersHere"])("rejects weak password %s", (password) => {
    expect(passwordSchema.safeParse(password).success).toBe(false);
  });
});
