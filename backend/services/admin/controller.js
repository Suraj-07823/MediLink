const Doctor = require('../../models/Doctor');

// GET /api/admin/doctors/pending
async function getPendingDoctors(req, res) {
  try {
    const doctors = await Doctor.find({ status: 'pending' })
      .populate('userId', 'name email phone')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    console.error('Admin pending doctors error:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch pending doctors' });
  }
}

// GET /api/admin/doctors
async function getDoctors(req, res) {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const doctors = await Doctor.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    console.error('Admin doctors list error:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch doctors' });
  }
}

// PUT /api/admin/doctors/:id/approve
async function approveDoctor(req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (doctor.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Doctor is already approved' });
    }

    doctor.status = 'approved';
    doctor.rejectionReason = '';
    await doctor.save();

    console.log('TODO: send approval email to doctor');

    const updatedDoctor = await Doctor.findById(doctor._id).populate('userId', 'name email phone');
    res.json({ success: true, message: 'Doctor approved successfully', doctor: updatedDoctor });
  } catch (error) {
    console.error('Admin approve doctor error:', error);
    res.status(500).json({ success: false, message: 'Unable to approve doctor' });
  }
}

// PUT /api/admin/doctors/:id/reject
async function rejectDoctor(req, res) {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    doctor.status = 'rejected';
    doctor.rejectionReason = reason.trim();
    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctor._id).populate('userId', 'name email phone');
    res.json({ success: true, message: 'Doctor rejected', doctor: updatedDoctor });
  } catch (error) {
    console.error('Admin reject doctor error:', error);
    res.status(500).json({ success: false, message: 'Unable to reject doctor' });
  }
}

module.exports = {
  getPendingDoctors,
  getDoctors,
  approveDoctor,
  rejectDoctor
};
