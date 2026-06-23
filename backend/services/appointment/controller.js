const Appointment = require('../../models/Appointment');
const Doctor = require('../../models/Doctor');

async function list(req, res) {
  try {
    const filter = req.user.role === 'patient' ? { patientId: req.user._id } : req.user.role === 'doctor' ? { doctorId: req.user._id } : {};
    const appointments = await Appointment.find(filter)
      .populate({ path: 'patientId', select: 'name email phone' })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
}

async function create(req, res) {
  const { doctorId, date, timeSlot, symptoms } = req.body;
  try {
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ message: 'doctorId, date, and timeSlot are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (doctor.status !== 'approved') return res.status(400).json({ message: 'Doctor is not available for booking' });

    const requestedDate = new Date(date);
    requestedDate.setUTCHours(0, 0, 0, 0);

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: requestedDate,
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    if (existingAppointment) return res.status(409).json({ message: 'This time slot is already booked' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId: doctor._id,
      date: requestedDate,
      timeSlot,
      symptoms,
      fee: doctor.consultationFee,
      otp,
      otpExpiry,
      status: 'booked'
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        _id: appointment._id,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        status: appointment.status,
        fee: appointment.fee,
        otp: appointment.otp,
        otpExpiry: appointment.otpExpiry
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }
    res.status(500).json({ message: 'Failed to book appointment', error: error.message });
  }
}

async function checkin(req, res) {
  const { otp } = req.body;
  try {
    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.status === 'checked-in') {
      return res.status(400).json({ message: 'Already checked in' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is cancelled' });
    }

    if (appointment.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (appointment.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    appointment.status = 'checked-in';
    appointment.checkedInAt = new Date();
    await appointment.save();

    res.json({ success: true, message: 'Check-in successful', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Check-in failed', error: error.message });
  }
}

module.exports = { list, create, checkin };
