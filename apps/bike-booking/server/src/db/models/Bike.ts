import mongoose, { Schema, Document } from "mongoose";

export interface IBike extends Document {
  name: string;
  type: "mountain" | "road" | "city" | "electric";
  description: string;
  pricePerHour: number;
  imageUrl: string;
}

const bikeSchema = new Schema<IBike>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["mountain", "road", "city", "electric"],
    },
    description: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    imageUrl: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Bike = mongoose.model<IBike>("Bike", bikeSchema);
