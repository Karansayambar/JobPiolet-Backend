const mongoose = require("mongoose");

const favoriteJobSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Jobs",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FavoriteJob", favoriteJobSchema);
