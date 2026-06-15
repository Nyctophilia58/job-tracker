import bcrypt from "bcryptjs";

export const hashPassword = async (plainPassword: string): Promise<string> => {
  // bcrypt.hash generates a hashed version of the password
  // The number 10 is the salt rounds, which affects the hashing complexity
  return bcrypt.hash(plainPassword, 10);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  // bcrypt.compare compares the plain password with the hashed version
  return bcrypt.compare(plainPassword, hashedPassword);
};
