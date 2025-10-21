import mongoose, { Schema, Document } from "mongoose";

export interface OrderFilters {
  minWorth?: number;
  maxWorth?: number;
}

export interface IOrderProduct {
  productId: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: number;
  products: IOrderProduct[];
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    products: [
      {
        _id: false,
        productId: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "PLN",
    },
    status: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
OrderSchema.index({ totalAmount: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
