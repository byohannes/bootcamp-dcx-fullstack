import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBooking extends Document {
  bikeId: Types.ObjectId;
  userId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: "confirmed" | "cancelled";
}

const bookingSchema = new Schema<IBooking>(
  {
    bikeId: { type: Schema.Types.ObjectId, ref: "Bike", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        if (ret.bikeId && typeof ret.bikeId === "object") {
          ret.bikeId = ret.bikeId.toString();
        }
        if (ret.userId && typeof ret.userId === "object") {
          ret.userId = ret.userId.toString();
        }
        if (ret.startTime instanceof Date) {
          ret.startTime = ret.startTime.toISOString();
        }
        if (ret.endTime instanceof Date) {
          ret.endTime = ret.endTime.toISOString();
        }
        if (ret.createdAt instanceof Date) {
          ret.createdAt = ret.createdAt.toISOString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Index for checking availability (overlapping bookings)
bookingSchema.index({ bikeId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ userId: 1 });

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
