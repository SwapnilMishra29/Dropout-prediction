const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const Student = require('../models/Student');
const AcademicRecord = require('../models/AcademicRecord');
const FinanceRecord = require('../models/FinanceRecord');
const predictionService = require('../services/predictionService');
const mlService = require('../services/mlService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Parse CSV file to JSON
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.unlinkSync(filePath); // Delete file after parsing
        resolve(results);
      })
      .on('error', reject);
  });
};

// Validate and process student data
const processStudentData = async (studentsData) => {
  const results = {
    successful: [],
    failed: [],
    duplicates: []
  };
  
  for (const student of studentsData) {
    try {
      // Check if student already exists
      const existingStudent = await Student.findOne({ 
        $or: [
          { student_id: student.student_id },
          { email: student.email }
        ]
      });
      
      if (existingStudent) {
        results.duplicates.push({
          student_id: student.student_id,
          reason: 'Student ID or Email already exists'
        });
        continue;
      }
      
      // Create new student
      const newStudent = new Student({
        student_id: student.student_id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        program: student.program,
        enrollment_year: parseInt(student.enrollment_year),
        current_semester: parseInt(student.current_semester) || 1,
        department: student.department,
        gender: student.gender,
        date_of_birth: student.date_of_birth ? new Date(student.date_of_birth) : null,
        address: {
          city: student.city,
          state: student.state,
          country: student.country || 'India'
        },
        guardian_name: student.guardian_name,
        guardian_phone: student.guardian_phone,
        status: 'Active'
      });
      
      await newStudent.save();
      results.successful.push(newStudent);
    } catch (error) {
      results.failed.push({
        student_id: student.student_id,
        error: error.message
      });
    }
  }
  
  return results;
};

// Process academic records
const processAcademicData = async (academicData) => {
  const results = {
    successful: [],
    failed: [],
    skipped: []
  };
  
  for (const record of academicData) {
    try {
      // Find student
      const student = await Student.findOne({ student_id: record.student_id });
      if (!student) {
        results.skipped.push({
          student_id: record.student_id,
          reason: 'Student not found'
        });
        continue;
      }
      
      // Check if record already exists for this semester
      const existingRecord = await AcademicRecord.findOne({
        student_id: student._id,
        semester: parseInt(record.semester),
        academic_year: record.academic_year
      });
      
      if (existingRecord) {
        results.skipped.push({
          student_id: record.student_id,
          semester: record.semester,
          reason: 'Record already exists for this semester'
        });
        continue;
      }
      
      // Create academic record
      const academicRecord = new AcademicRecord({
        student_id: student._id,
        semester: parseInt(record.semester),
        academic_year: record.academic_year,
        attendance_percentage: parseFloat(record.attendance_percentage),
        test1_marks: parseFloat(record.test1_marks),
        test2_marks: parseFloat(record.test2_marks),
        subjects: record.subjects ? JSON.parse(record.subjects) : [],
        cgpa: record.cgpa ? parseFloat(record.cgpa) : null
      });
      
      await academicRecord.save();
      results.successful.push(academicRecord);
    } catch (error) {
      results.failed.push({
        student_id: record.student_id,
        error: error.message
      });
    }
  }
  
  return results;
};

// Process finance records
const processFinanceData = async (financeData) => {
  const results = {
    successful: [],
    failed: [],
    skipped: []
  };
  
  for (const record of financeData) {
    try {
      // Find student
      const student = await Student.findOne({ student_id: record.student_id });
      if (!student) {
        results.skipped.push({
          student_id: record.student_id,
          reason: 'Student not found'
        });
        continue;
      }
      
      // Check if record already exists for this semester
      const existingRecord = await FinanceRecord.findOne({
        student_id: student._id,
        semester: parseInt(record.semester),
        academic_year: record.academic_year
      });
      
      if (existingRecord) {
        results.skipped.push({
          student_id: record.student_id,
          semester: record.semester,
          reason: 'Record already exists for this semester'
        });
        continue;
      }
      
      // Calculate amounts
      const totalFees = parseFloat(record.total_fees);
      const amountPaid = parseFloat(record.amount_paid) || 0;
      const pendingAmount = totalFees - amountPaid;
      
      // Create finance record
      const financeRecord = new FinanceRecord({
        student_id: student._id,
        semester: parseInt(record.semester),
        academic_year: record.academic_year,
        total_fees: totalFees,
        fee_paid: pendingAmount <= 0,
        amount_paid: amountPaid,
        pending_amount: pendingAmount,
        due_date: record.due_date ? new Date(record.due_date) : null,
        payment_date: record.payment_date ? new Date(record.payment_date) : null,
        scholarship_percentage: parseFloat(record.scholarship_percentage) || 0
      });
      
      await financeRecord.save();
      results.successful.push(financeRecord);
    } catch (error) {
      results.failed.push({
        student_id: record.student_id,
        error: error.message
      });
    }
  }
  
  return results;
};

// Process and predict for uploaded data
const processAndPredict = async (studentId) => {
  try {
    const prediction = await predictionService.predictRisk(studentId);
    return prediction;
  } catch (error) {
    console.error(`Prediction failed for ${studentId}:`, error.message);
    return null;
  }
};

// Upload endpoints
exports.uploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const studentsData = await parseCSV(req.file.path);
    const results = await processStudentData(studentsData);
    
    res.json({
      success: true,
      data: {
        total: studentsData.length,
        successful: results.successful.length,
        failed: results.failed.length,
        duplicates: results.duplicates.length,
        details: {
          successful: results.successful.map(s => s.student_id),
          failed: results.failed,
          duplicates: results.duplicates
        }
      },
      message: `Upload complete: ${results.successful.length} students added`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadAcademicRecords = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const academicData = await parseCSV(req.file.path);
    const results = await processAcademicData(academicData);
    
    res.json({
      success: true,
      data: {
        total: academicData.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        details: {
          successful: results.successful.map(r => ({ 
            student_id: r.student_id, 
            semester: r.semester 
          })),
          failed: results.failed,
          skipped: results.skipped
        }
      },
      message: `Upload complete: ${results.successful.length} academic records added`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadFinanceRecords = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const financeData = await parseCSV(req.file.path);
    const results = await processFinanceData(financeData);
    
    res.json({
      success: true,
      data: {
        total: financeData.length,
        successful: results.successful.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        details: {
          successful: results.successful.map(r => ({ 
            student_id: r.student_id, 
            semester: r.semester 
          })),
          failed: results.failed,
          skipped: results.skipped
        }
      },
      message: `Upload complete: ${results.successful.length} finance records added`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Combined upload with all three files
exports.uploadCompleteData = async (req, res) => {
  try {
    const files = req.files;
    
    if (!files.students || !files.academic || !files.finance) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please upload all three files: students, academic, finance' 
      });
    }
    
    // Process all three files
    const studentsData = await parseCSV(files.students[0].path);
    const academicData = await parseCSV(files.academic[0].path);
    const financeData = await parseCSV(files.finance[0].path);
    
    // Process students first
    const studentResults = await processStudentData(studentsData);
    
    // Process academic records
    const academicResults = await processAcademicData(academicData);
    
    // Process finance records
    const financeResults = await processFinanceData(financeData);
    
    // Trigger predictions for new students (optional)
    const predictionPromises = studentResults.successful.map(student => 
      processAndPredict(student.student_id)
    );
    await Promise.allSettled(predictionPromises);
    
    res.json({
      success: true,
      data: {
        students: {
          total: studentsData.length,
          successful: studentResults.successful.length,
          failed: studentResults.failed.length,
          duplicates: studentResults.duplicates.length
        },
        academic: {
          total: academicData.length,
          successful: academicResults.successful.length,
          failed: academicResults.failed.length,
          skipped: academicResults.skipped.length
        },
        finance: {
          total: financeData.length,
          successful: financeResults.successful.length,
          failed: financeResults.failed.length,
          skipped: financeResults.skipped.length
        }
      },
      message: 'Complete data upload processed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Batch prediction after upload
exports.uploadAndPredict = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const data = await parseCSV(req.file.path);
    
    // Validate required columns for prediction
    const requiredColumns = ['student_id', 'attendance_percentage', 'test1_marks', 'test2_marks', 'fees_paid'];
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !firstRow.hasOwnProperty(col));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Missing required columns: ${missingColumns.join(', ')}` 
      });
    }
    
    // Prepare data for batch prediction
    const predictions = [];
    const errors = [];
    
    for (const record of data) {
      try {
        // Find student to get MongoDB ID if needed
        let student = await Student.findOne({ student_id: record.student_id });
        
        // Prepare features for ML
        const features = {
          student_id: record.student_id,
          attendance_percentage: parseFloat(record.attendance_percentage),
          test1_marks: parseFloat(record.test1_marks),
          test2_marks: parseFloat(record.test2_marks),
          fees_paid: record.fees_paid === 'true' || record.fees_paid === 'TRUE' || record.fees_paid === '1',
          average_marks: (parseFloat(record.test1_marks) + parseFloat(record.test2_marks)) / 2,
          marks_trend: parseInt(record.marks_trend) || 0,
          attendance_flag: parseFloat(record.attendance_percentage) < 75 ? 1 : 0,
          fee_flag: (record.fees_paid === 'true' || record.fees_paid === 'TRUE') ? 0 : 1,
          low_marks_flag: ((parseFloat(record.test1_marks) + parseFloat(record.test2_marks)) / 2) < 50 ? 1 : 0,
          performance_ratio: ((parseFloat(record.test1_marks) + parseFloat(record.test2_marks)) / 2) / 50
        };
        
        // Call ML service
        const mlResult = await mlService.predict(features);
        
        let final_score, risk_level;
        
        if (mlResult.success) {
          final_score = mlResult.data.final_score;
          risk_level = mlResult.data.risk_level;
        } else {
          // Fallback
          const fallback = mlService.getFallbackPrediction(features);
          final_score = fallback.final_score;
          risk_level = fallback.risk_level;
        }
        
        predictions.push({
          student_id: record.student_id,
          final_score: final_score,
          risk_level: risk_level,
          features: features
        });
        
        // Store prediction in database if student exists
        if (student) {
          await predictionService.savePrediction(student._id, final_score, risk_level, features);
        }
        
      } catch (error) {
        errors.push({
          student_id: record.student_id,
          error: error.message
        });
      }
    }
    
    // Generate CSV output
    const outputFields = ['student_id', 'final_score', 'risk_level'];
    const json2csvParser = new Parser({ fields: outputFields });
    const csvOutput = json2csvParser.parse(predictions);
    
    // Save predictions to file
    const outputPath = path.join(__dirname, '../../uploads', `predictions_${Date.now()}.csv`);
    fs.writeFileSync(outputPath, csvOutput);
    
    res.json({
      success: true,
      data: {
        total: data.length,
        successful: predictions.length,
        failed: errors.length,
        predictions: predictions,
        errors: errors,
        download_url: `/api/uploads/download/${path.basename(outputPath)}`
      },
      message: `Batch prediction completed for ${predictions.length} students`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Download prediction results
exports.downloadPredictions = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get upload templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = {
      students: {
        columns: ['student_id', 'name', 'email', 'phone', 'program', 'enrollment_year', 'current_semester', 'department', 'gender', 'city', 'state', 'guardian_name', 'guardian_phone'],
        sample: [
          {
            student_id: 'STU001',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890',
            program: 'Computer Science',
            enrollment_year: '2023',
            current_semester: '2',
            department: 'Engineering',
            gender: 'Male',
            city: 'Mumbai',
            state: 'Maharashtra',
            guardian_name: 'Jane Doe',
            guardian_phone: '0987654321'
          }
        ]
      },
      academic: {
        columns: ['student_id', 'semester', 'academic_year', 'attendance_percentage', 'test1_marks', 'test2_marks', 'cgpa'],
        sample: [
          {
            student_id: 'STU001',
            semester: '2',
            academic_year: '2023-2024',
            attendance_percentage: '85',
            test1_marks: '75',
            test2_marks: '80',
            cgpa: '7.5'
          }
        ]
      },
      finance: {
        columns: ['student_id', 'semester', 'academic_year', 'total_fees', 'amount_paid', 'due_date', 'scholarship_percentage'],
        sample: [
          {
            student_id: 'STU001',
            semester: '2',
            academic_year: '2023-2024',
            total_fees: '50000',
            amount_paid: '25000',
            due_date: '2024-03-15',
            scholarship_percentage: '10'
          }
        ]
      },
      prediction_batch: {
        columns: ['student_id', 'attendance_percentage', 'test1_marks', 'test2_marks', 'fees_paid'],
        sample: [
          {
            student_id: 'STU001',
            attendance_percentage: '65',
            test1_marks: '35',
            test2_marks: '45',
            fees_paid: 'false'
          }
        ]
      }
    };
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Export multer middleware
exports.upload = upload;
exports.uploadSingle = upload.single('file');
exports.uploadMultiple = upload.fields([
  { name: 'students', maxCount: 1 },
  { name: 'academic', maxCount: 1 },
  { name: 'finance', maxCount: 1 }
]);