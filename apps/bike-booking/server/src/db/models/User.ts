import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        if (ret.createdAt instanceof Date) {
          ret.createdAt = ret.createdAt.toISOString();
        }
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  },
);

// Hash password automatically before saving (only when modified).
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Compare a plaintext candidate against the stored hash.
userSchema.methods.comparePassword = async function comparePassword(
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Note: unique: true already creates an index, no need for additional userSchema.index({ email: 1 })

export const User = mongoose.model<IUser>("User", userSchema);
