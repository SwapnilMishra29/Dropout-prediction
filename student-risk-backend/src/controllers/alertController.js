const Alert = require('../models/Alert');

exports.getAllAlerts = async (req, res) => {

  try {

    const alerts = await Alert.find().populate('student_id').sort({ created_at: -1 });

    res.json(alerts);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};