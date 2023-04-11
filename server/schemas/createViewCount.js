import mongoose from "mongoose";

const viewCountSchema = new mongoose.Schema({
  productGroupName: {
    type: String,
    required: true,
    index: true,
  },
  productViewCount: {
    type: Number,
    required: true,
  },
  productClickedCount: {
    type: Number,
    required: true,
  },
  productAddedToCartCount: {
    type: Number,
    required: true,
  },
  productCheckedOutCount: {
    type: Number,
    required: true,
  },
  totalRevenue: {
    type: Number,
    required: true,
  },
  perProductViewDetails: [
    {
      productType: {
        type: String,
        required: true,
        index: true,
      },
      productId: {
        type: String,
        required: true,
      },
      perProductViewCount: {
        type: Number,
        required: true,
      },
      perProductClickCount: {
        type: Number,
        required: true,
      },
      perProductAddedToCartCount: {
        type: Number,
        required: true,
      },
      perProductCheckedOutCount: {
        type: Number,
        required: true,
      },
      perLineItemRevenue: {
        type: Number,
        required: true,
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

// viewCountSchema.index({
//   groupName: 1,
//   'groupProducts.productType': 1,
//   'groupProducts.selectedProductTitle': 1,
// });

export const ViewCount = mongoose.model("ViewCount", viewCountSchema);

// export default GroupProduct;