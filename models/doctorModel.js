import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      default: "USER",
    },
    specialization: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
      match: [
      /^(\d{4}[-\s]\d{7}|\+\d{1,3}[-\s]\d{3}[-\s]\d{7})$/, 
      'Invalid phone numberformat'
    ],
      trim: true,
    },
    fees: {
      type: Number,
      required: true,
    },
    days: [
      {
        type: String,
        required: true,
      },
    ],
    timing: [
      {
        type: String,
        required: true,
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
      },
    ],
    experience: {
      type: String,
      required: true,
    },
    hospital: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

doctorSchema.pre('save', function(next) {
  if (this.contact) {
    this.contact = this.contact.replace(/-/g, ' ');
  }
  next();
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
