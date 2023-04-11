import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  }
});

export const sessionLoad = mongoose.model("shopify_sessions", sessionSchema);

// export default GroupProduct;