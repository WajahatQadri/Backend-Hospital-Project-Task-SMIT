import User from "../models/userModel.js";
import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import Medicine from "../models/medicineModel.js";
import { sendToken } from "../utils/JWTToken.js";
import ApiFeatures from "../utils/apiFeatures.js";
import { sendEmail } from "../utils/sendEmail.js";

export const registerPatient = async (req, res) => {
  try {
    const { age, gender, bloodgroup, contact, address, disease , notes } = req.body;

    // 1. Prevent duplicate profiles
    const existing = await Patient.findOne({ user: req.user._id });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Profile already exists" });

    // 2. Create the Patient profile
    await Patient.create({
      user: req.user._id,
      role: "PATIENT",
      age,
      gender: gender.toUpperCase(),
      bloodgroup: bloodgroup?.toUpperCase(),
      contact,
      address,
      disease,
      notes,
      history: [
        {
          disease,
          notes,
          treatment: new Date(),
        },
      ],
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { role: "PATIENT" },
      { new: true },
    );

    sendToken(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate("user", "name email")
      .populate("medicines.medicine", "name price potency")
      .populate({
        path: "assigned_doctors",
        populate: {
          path: "user", // Populates the name inside the doctor's user field
          select: "name",
        },
      });
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });

    res.status(200).json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });

    await Patient.findByIdAndDelete(patient._id);

    const user = await User.findById(req.user._id);
    user.role = "USER";
    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePatientProfile = async (req, res) => {
  try {
    let patient = await Patient.findOne({ user: req.user._id });

    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient profile not found" });

    patient = await Patient.findOneAndUpdate({ user: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    });

    res
      .status(200)
      .json({ success: true, message: "Profile Updated Successfully", patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminDeletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });

    await Patient.findByIdAndDelete(id);
    await User.findByIdAndDelete(patient.user);

    res.status(200).json({
      success: true,
      message: "Patient and User account deleted by Admin",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const resultPerPage = 10;
    const patientsCount = await Patient.countDocuments();
    const apiFeature = new ApiFeatures(
      Patient.find().populate("user", "name email"),
      req.query,
    )
      .search()
      .filter()
      .sort()
      .pagination(resultPerPage);

    const patients = await apiFeature.query;
    res.status(200).json({ success: true, count: patients.length, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { disease, notes } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });

    patient.history.push({ disease, notes, treatment: Date.now() });

    await patient.save();
    res
      .status(200)
      .json({ success: true, message: "History Updated", patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const prescribeMedicine = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { medicineId, dosage } = req.body;

    const patient = await Patient.findById(patientId);
    const medicine = await Medicine.findById(medicineId);
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!patient || !medicine || !doctor)
      return res.status(404).json({ success: false, message: "Data missing" });

    if (medicine.stock <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Medicine out of stock" });

    patient.medicines.push({
      medicine: medicineId,
      givenBy: doctor._id,
      dosage,
    });

    medicine.stock -= 1;
    if (medicine.stock === 0) medicine.status = "Out of Stock";

    await patient.save();
    await medicine.save();

    res
      .status(200)
      .json({ success: true, message: "Medicine Prescribed Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const undoPrescription = async (req, res) => {
  try {
    const { patientId, prescriptionId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });

    const prescription = patient.medicines.id(prescriptionId);
    if (!prescription)
      return res
        .status(404)
        .json({ success: false, message: "Prescription entry not found" });

    const medicine = await Medicine.findById(prescription.medicine);
    if (medicine) {
      medicine.stock += 1;
      medicine.status = "Available";
      await medicine.save();
    }

    prescription.deleteOne();
    await patient.save();

    res.status(200).json({
      success: true,
      message: "Prescription undone and stock returned",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATED: BOOK APPOINTMENT WITH DATE/TIME
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { appointmentDate, appointmentTime } = req.body;
    const userId = req.user._id;

    const patient = await Patient.findOne({ user: userId });
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });

    // 1. Update Patient (Add to assigned_doctors and history)
    await Patient.findByIdAndUpdate(patient._id, {
      $addToSet: { assigned_doctors: doctorId }, // $addToSet prevents duplicates
      $push: {
        history: {
          disease: `APPOINTMENT BOOKED`,
          treatment: new Date(appointmentDate),
          notes: `Slot: ${appointmentTime}`,
        },
      },
    });

    // 2. Update Doctor (Add to patients array)
    // THE FIX: Using findByIdAndUpdate bypasses the "hospital required" trap
    await Doctor.findByIdAndUpdate(doctorId, {
      $addToSet: { patients: patient._id },
    });

    res.status(200).json({
      success: true,
      message: "Appointment Booked Successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE / CANCEL APPOINTMENT
export const deleteAppointment = async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    // 1. Remove Doctor from Patient's 'assigned_doctors' list
    await Patient.findByIdAndUpdate(patientId, {
      $pull: { assigned_doctors: doctorId },
    });

    // 2. Remove Patient from Doctor's 'patients' list
    await Doctor.findByIdAndUpdate(doctorId, {
      $pull: { patients: patientId },
    });

    res.status(200).json({
      success: true,
      message: "Appointment cancelled and records updated.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
