import mongoose from "mongoose";

const excelDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Stores any JSON object
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ExcelData", excelDataSchema);
