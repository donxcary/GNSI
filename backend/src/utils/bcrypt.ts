import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRounds: number = 10) => {
  return bcrypt.hash(value, saltRounds);
};

export const compareValues = async (value: string, hashedValue: string) => {
  return bcrypt.compare(value, hashedValue);
};
