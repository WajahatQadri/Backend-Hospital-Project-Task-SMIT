import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import ApiFeatures from "../utils/apiFeatures.js";

export const applyToBeDoctor = async (req, res) => {
  try {
    const {
      specialization,
      contact,
      fees,
      days,
      timing,
      experience,
      hospital,
    } = req.body;

    const alreadyApplied = await Doctor.findOne({
      user: req.user._id,
    }).populate("user", "name email");
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ success: false, message: "Application already submitted" });
    }

    const doctor = await Doctor.create({
      user: req.user._id,
      specialization: specialization.toUpperCase(),
      contact,
      fees,
      days,
      timing,
      experience,
      hospital,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted. Please wait for Admin approval.",
      doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId).populate(
      "user",
      "name email",
    );
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    const user = await User.findById(doctor.user);

    doctor.isApproved = true;
    doctor.role = "DOCTOR";
    user.role = "DOCTOR";

    await doctor.save();
    await user.save();

    const message = `Congratulations Dr. ${user.name}! Your application has been approved. You can now access the Doctor Dashboard.`;

    await sendEmail({
      email: user.email,
      subject: "Doctor Account Approved",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Doctor approved and role updated to DOCTOR",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const resultPerPage = 10;

    const apiFeature = new ApiFeatures(
      Doctor.find({ isApproved: true }).populate("user", "name email"),
      req.query,
    )
      .search()
      .filter()
      .sort()
      .pagination(resultPerPage);

    const doctors = await apiFeature.query;

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorDetails = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    let doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor profile not found" });

    doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    });

    res
      .status(200)
      .json({ success: true, message: "Profile Updated Successfully", doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ isApproved: false }).populate(
      "user",
      "name email",
    );
    res.status(200).json({ success: true, pendingDoctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectDoctorApplication = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId).populate(
      "user",
      "name email",
    );
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });

    await Doctor.findByIdAndDelete(doctorId);

    const message = `Hello ${doctor.user.name}, We have reviewed your application to join the hospital. Unfortunately, we cannot approve your account at this time.`;

    await sendEmail({
      email: doctor.user.email,
      subject: "Doctor Application Update",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Application rejected and user notified.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelDoctorApplication = async (req, res) => {
  try {
    const application = await Doctor.findOne({ user: req.user._id }).populate(
      "user",
      "name email",
    );

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "No application found" });
    }

    if (application.isApproved === true) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Approved accounts cannot be cancelled. Please contact Admin.",
        });
    }

    await Doctor.findByIdAndDelete(application._id);

    res.status(200).json({
      success: true,
      message: "Your Doctor application has been cancelled successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate(
      "user",
      "name email",
    );
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });

    await Doctor.findByIdAndDelete(doctor._id);

    const user = await User.findById(req.user._id);
    user.role = "USER";
    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminDeleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id).populate("user", "name email");
    if (!doctor)
      return res.status(404).json({ success: false, message: "Not found" });

    const userId = doctor.user;
    await Doctor.findByIdAndDelete(id);
    await User.findByIdAndDelete(userId);
    res.status(200).json({ success: true, message: "Doctor and User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorSelfProfileController = async (req, res) => {
  try {
    // Find the doctor document where 'user' matches the logged-in ID
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate("user", "name email avatar")
      .populate({
        path: "patients",
        populate: { path: "user", select: "name email" }, // Deeper population to get names
      });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor, // Return the doctor object so your frontend can use it
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
