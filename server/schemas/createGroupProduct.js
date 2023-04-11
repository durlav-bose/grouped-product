import mongoose from "mongoose";

const groupProductSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    index: true,
  },
  shopUrl: {
    type: String,
    required: true,
  },
  groupProducts: [
    {
      productType: {
        type: String,
        required: true,
        index: true,
      },
      productImage: {
        type: String,
        required: true,
      },
      productId: {
        type: String,
        required: true,
      },
      selectedProductTitle: {
        type: String,
        index: true,
      },
      selectedProductImage: {
        type: String,
      },
      productHandle: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

groupProductSchema.index({
  groupName: 1,
  'groupProducts.productType': 1,
  'groupProducts.selectedProductTitle': 1,
});

export const GroupProduct = mongoose.model("GroupProduct", groupProductSchema);

// export default GroupProduct;