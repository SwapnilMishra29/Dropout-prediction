# Dropout Early Warning System

An AI-powered student risk analytics platform that helps institutions identify at-risk students early and take proactive intervention measures before dropout occurs.

## 🌐 Live Demo

🚀 Frontend Deployment: https://dropout-ews-frontend.onrender.com/

---

## ✨ Key Features

### 📊 Smart Student Risk Prediction
- Hybrid prediction system using:
  - Rule-based risk analysis
  - Machine Learning risk scoring
- Predicts student dropout probability based on:
  - Attendance
  - Academic performance
  - Financial status
  - Behavioral indicators

### 📁 CSV Data Upload System
- Upload bulk student datasets through CSV
- Separate uploads for:
  - Student details
  - Academic records
  - Financial data
- Automatic validation and preprocessing

### 📈 Interactive Analytics Dashboard
- Real-time student risk visualization
- Risk distribution charts
- High-risk student monitoring
- Institution-wide analytics overview

### 🚨 Early Warning Alerts
- Detects high-risk students instantly
- Categorizes students into:
  - Low Risk
  - Medium Risk
  - High Risk
- Enables timely intervention tracking

### 🛠️ Full Student Management
- CRUD operations for student records
- Update academic and finance information
- View detailed student profiles
- Centralized student database

### 🔐 Authentication & Validation
- Secure API handling
- Input validation
- Protected backend architecture

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Machine Learning | Python + Flask + scikit-learn |
| Charts & Visualization | Recharts |
| File Uploads | Multer |
| API Communication | Axios |

---

## 🏗️ System Architecture

```text
Frontend (React)
       │
       ▼
Backend API (Node.js + Express)
       │
 ┌─────┴─────┐
 ▼           ▼
MongoDB    ML Service (Flask)
                │
                ▼
        Risk Prediction Engine
```

---

# ⚙️ Installation & Setup

## Prerequisites

- Node.js >= 14
- Python >= 3.8
- MongoDB (Local or Atlas)

---

## 1️⃣ Clone Repository

```bash
git clone <repo-url>
cd dropout-prediction
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure `.env`

```env
MONGO_URI=mongodb://localhost:27017/dropout-prediction
ML_SERVICE_URL=http://localhost:5000
PORT=3000
```

Run backend server:

```bash
npm run dev
```

---

## 3️⃣ ML Service Setup

```bash
cd ../ml-service

python -m venv venv
```

### Activate Virtual Environment

#### Windows
```bash
venv\Scripts\activate
```

#### Linux / macOS
```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run Flask ML service:

```bash
python main.py
```

---

## 4️⃣ Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

Run frontend:

```bash
npm run dev
```

---

# 📂 Project Structure

```text
dropout-prediction/
│
├── backend/               # Express REST API
├── frontend/              # React Dashboard
├── ml-service/            # Flask ML Service
├── sample-data/           # CSV test datasets
├── docs/                  # Documentation
├── docker-compose.yml
└── README.md
```

---

# 📡 API Endpoints

## 👨‍🎓 Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Fetch all students |
| GET | `/api/students/:id` | Fetch student by ID |
| PUT | `/api/students/:id` | Update student |

---

## 📤 Upload APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload CSV data |
| GET | `/api/upload` | Fetch uploaded files |

---

## 🚨 Alerts APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts/high-risk` | Get high-risk students |
| GET | `/api/alerts/summary` | Alerts analytics summary |

---

# 🗄️ Database Schema

## Student Model

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

---

# 🤖 Risk Prediction Engine

The system uses a **hybrid prediction model**.

## Rule-Based Logic

Risk increases when:
- Attendance < 75%
- Marks < 60%
- Pending fee payments

---

## Machine Learning Model

### Model Used
- RandomForest Classifier

### ML Workflow
- Data preprocessing
- Feature engineering
- Risk classification
- Prediction scoring

---

# 📊 Future Improvements

- Role-based authentication
- Email/SMS alert system
- Advanced analytics dashboard
- Student performance forecasting
- Deployment using Docker & Kubernetes
- Cloud-based ML model hosting
- Multi-institution support

---

# 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Developer

Built by **Swapnil Mishra**  
B.Tech CSE (Data Science)

---

# ⭐ Project Status

✅ Active Development  
🚀 Production Deployment Available  
📌 Latest Updated Version: 2026
