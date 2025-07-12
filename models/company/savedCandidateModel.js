const mongoose = require("mongoose");

const savedCandidateSchema = new mongoose.Schema(
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
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },
  },
  { timestamps: true }
);

const savedCandidate = mongoose.model("savedCandidate", savedCandidateSchema);
module.exports = savedCandidate;
