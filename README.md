# Dropout Early Warning System

An intelligent predictive system to identify at-risk students and enable proactive intervention.

## Features

✅ **Data Upload**: Import student attendance, marks, and fees data via CSV  
✅ **Risk Prediction**: ML-powered + rule-based risk scoring  
✅ **Dashboard**: Real-time visualization of student risk levels  
✅ **Alerts**: Identify and monitor high-risk students  
✅ **Data Management**: CRUD operations for student records  

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express + MongoDB |
| ML Service | Python + Flask + scikit-learn |

## Quick Start

### Prerequisites
- Node.js >= 14
- Python >= 3.8
- MongoDB running locally or remote connection

### Installation

1. **Clone and Setup Directories**
```bash
git clone <repo-url>
cd dropout-prediction
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure with your MongoDB URI
npm run dev
```

3. **ML Service Setup**
```bash
cd ../ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

4. **Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

## Project Structure

```
dropout-prediction/
├── backend/           # Express API
├── ml-service/        # Python ML + Rules Engine
├── frontend/          # React Dashboard
├── sample-data/       # Test CSVs
├── docs/              # Documentation
└── docker-compose.yml # Optional: Docker setup
```

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student

### Upload
- `POST /api/upload` - Upload CSV file
- `GET /api/upload` - List uploaded files

### Alerts
- `GET /api/alerts/high-risk` - Get high-risk students
- `GET /api/alerts/summary` - Get alerts summary

## Configuration

### Environment Variables

**Backend** (backend/.env)
```env
MONGO_URI=mongodb://localhost:27017/dropout-prediction
ML_SERVICE_URL=http://localhost:5000
PORT=3000
```

**ML Service** (ml-service/.env)
```env
ML_SERVICE_PORT=5000
DEBUG=True
```

**Frontend** (frontend/.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Database Schema

### Student Collection
```javascript
{
  studentId: String,
  name: String,
  email: String,
  attendancePercentage: Number,
  marksAverage: Number,
  feesPaid: Boolean,
  riskScore: Number,
  riskLevel: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Risk Assessment Model

The system uses a hybrid approach:

### Rule-Based Engine
- Attendance threshold: 75%
- Marks threshold: 60
- Fees payment status

### Machine Learning
- Trained RandomForest classifier (optional)
- Feature engineering for dropout prediction

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues or questions, please open an issue on GitHub.

---

**Last Updated**: March 2024  
**Version**: 1.0.0
