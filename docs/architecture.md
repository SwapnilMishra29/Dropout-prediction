# Dropout Early Warning System - Architecture

## Overview
This system predicts student dropout risk using machine learning and rule-based engines to enable proactive intervention.

## Components

### 1. Backend (Node.js/Express)
- **Purpose**: REST API for data management and orchestration
- **Stack**: Express.js, MongoDB, Axios
- **Key Features**:
  - Student data management
  - CSV file uploads
  - Alert management
  - Integration with ML service

### 2. ML Service (Python/Flask)
- **Purpose**: Predictive modeling and risk calculation
- **Stack**: Flask, scikit-learn, Pandas
- **Key Components**:
  - **Data Processing**: Merge and clean CSV files
  - **Feature Engineering**: Create relevant features
  - **Risk Rules**: Core logic rule engine
  - **ML Models**: Trained classifier for predictions

### 3. Frontend (React/Vite)
- **Purpose**: Interactive dashboard for administrators
- **Stack**: React, Tailwind CSS, React Router
- **Key Pages**:
  - Dashboard: Overview and student risk table
  - Upload Data: CSV file uploads
  - Student Details: Individual student information

## Data Flow

1. **Data Upload**: CSV files uploaded through frontend
2. **Data Processing**: Backend receives files, processes and merges
3. **Risk Calculation**: ML service calculates risk using rules + models
4. **Storage**: Results stored in MongoDB
5. **Display**: Frontend displays risk levels and alerts

## Risk Scoring Algorithm

Rules applied:
- Low attendance (< 75%): +0.4 points
- Low marks (< 60): +0.3 points
- Unpaid fees: +0.2 points
- Multiple factors: +0.1 bonus points

Risk Levels:
- **High**: Score ≥ 0.7
- **Medium**: Score 0.4-0.69
- **Low**: Score < 0.4

## Setup & Deployment

### Backend
```bash
cd backend
npm install
npm run dev
```

### ML Service
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Backend: `.env`
- `MONGO_URI`: MongoDB connection string
- `ML_SERVICE_URL`: URL to ML service
- `PORT`: Backend port

ML Service: `.env`
- `ML_SERVICE_PORT`: Flask port
- `DEBUG`: Debug mode
