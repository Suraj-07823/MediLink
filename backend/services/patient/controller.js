const Doctor = require('../../models/Doctor');
const Slot = require('../../models/Slot');
const Appointment = require('../../models/Appointment');

async function getDoctors(req, res) {
  try {
    const { speciality, city, status } = req.query;
    const filter = {};

    if (status) filter.status = status;
    else filter.status = 'approved';

    if (speciality) filter.speciality = { $regex: speciality, $options: 'i' };
    if (city) filter['clinicAddress.city'] = { $regex: city, $options: 'i' };

    const doctors = await Doctor.find(filter)
      .populate('userId', 'name email phone profilePhoto')
      .sort({ avgRating: -1, createdAt: -1 });

    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
  }
}

async function getSlots(req, res) {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param is required (YYYY-MM-DD)' });

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const requestedDate = new Date(date);
    requestedDate.setUTCHours(0, 0, 0, 0);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[requestedDate.getUTCDay()];

    const slots = await Slot.find({ doctorId: req.params.id, dayOfWeek, isActive: true });

    const bookedAppointments = await Appointment.find({
      doctorId: req.params.id,
      date: requestedDate,
      status: { $ne: 'cancelled' }
    });

    const bookedTimeSlots = bookedAppointments.map(a => a.timeSlot);

    const availableSlots = slots.map(slot => ({
      _id: slot._id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxPatients: slot.maxPatients,
      bookedCount: bookedTimeSlots.filter(t => t === slot.startTime).length,
      isAvailable: bookedTimeSlots.filter(t => t === slot.startTime).length < slot.maxPatients
    }));

    res.json({ success: true, date, dayOfWeek, slots: availableSlots });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch slots', error: error.message });
  }
}

async function createDoctor(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create doctor', error: error.message });
  }
}

module.exports = {
  getDoctors,
  getSlots,
  createDoctor
};
