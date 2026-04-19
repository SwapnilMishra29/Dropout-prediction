const multer = require('multer');
const Papa = require('papaparse');
const axios = require('axios');
const FormData = require('form-data');

const upload = multer({ storage: multer.memoryStorage() });

exports.uploadCSV = [
  upload.fields([
    { name: 'attendance', maxCount: 1 },
    { name: 'marks', maxCount: 1 },
    { name: 'fees', maxCount: 1 }
  ]),

  async (req, res) => {
    try {
      if (!req.files) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // 🔥 STEP 1: Parse CSV (for validation only)
      const attendanceData = Papa.parse(
        req.files.attendance[0].buffer.toString(),
        { header: true, skipEmptyLines: true }
      ).data;

      const marksData = Papa.parse(
        req.files.marks[0].buffer.toString(),
        { header: true, skipEmptyLines: true }
      ).data;

      const feesData = Papa.parse(
        req.files.fees[0].buffer.toString(),
        { header: true, skipEmptyLines: true }
      ).data;

      console.log("✅ CSV Parsed Successfully");

      // 🔥 STEP 2: Send files to Flask
      const FormData = require('form-data');

// 🔥 Send to Flask
const formData = new FormData();

formData.append(
  "attendance",
  req.files.attendance[0].buffer,
  "attendance.csv"
);

formData.append(
  "marks",
  req.files.marks[0].buffer,
  "marks.csv"
);

formData.append(
  "fees",
  req.files.fees[0].buffer,
  "fees.csv"
);

console.log("🚀 Calling Flask API...");

const flaskResponse = await axios.post(
  `${process.env.ML_API_URL}/batch_predict`,
  formData,
  {
    headers: formData.getHeaders()
  }
);



return res.json({
  message: "Predictions generated successfully",
  data: flaskResponse.data
});

    } catch (err) {
      console.error("❌ Upload Error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }
];