# RealTimeTransit

**A professional-grade, multiplatform project designed to handle GTFS, GTFS Realtime data, and other transport scheduling information.**

## 🚀 Overview

RealTimeTransit is a **comprehensive solution** for managing, processing, and presenting **public transport data**. It enables **real-time monitoring**, efficient **route planning**, and offers a **powerful API** for developers.

### Key Features:
- ✅ **Support for GTFS & GTFS Realtime** – Handles both static and real-time transport data.
- ✅ **Live Transport Tracking** – Get real-time updates on vehicle locations and delays.
- ✅ **Route Planning** – Plan journeys efficiently from stop to stop.
- ✅ **RESTful API** – Provides structured endpoints for data access.
- ✅ **Multiplatform Support** – Works across web and mobile devices.

---

## 📂 Project Structure

### 🔹 **Backend**
- 🚀 **FastAPI-based API** for efficient transport data handling.
- 🗄 **PostgreSQL with SQLAlchemy ORM** for robust data storage.
- ⚡ **Optimized data processing** ensuring fast responses.

### 🔹 **Frontend**
- 🌐 **Web Application** – Built with **React** for an intuitive user experience.
- 📱 **Mobile Application** – Developed in **React Native** for cross-platform compatibility (Planned).

### 🔹 **Database**
- 🗄 **PostgreSQL** – Optimized for handling GTFS datasets.
- 🔍 **SQLAlchemy ORM** – Simplifies database interactions and queries.

---

## 🛠 Installation & Setup

### **Database Connection**
To connect to a PostgreSQL database, create a `.env` file in the `/backend` directory and configure the necessary environment variables:

```bash
echo "DATABASE_URL=postgresql://user:password@localhost:5432/realtime_transit" > backend/.env
```

Ensure PostgreSQL is running and the database `realtime_transit` is created before starting the backend.

### **Backend**

Ensure you have set up the database connection before proceeding.
```bash
git clone https://github.com/maslankamateusz/RealTimeTransit.git
cd RealTimeTransit/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### **Frontend Setup**
The frontend is a **React application**. To run it, follow these steps:

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and configure the API URL (if needed):
   ```bash
   echo "REACT_APP_API_URL=http://127.0.0.1:8000" > .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and go to:
   ```
   http://localhost:5173
   ```

---

## 📡 API Endpoints

The backend provides **RESTful APIs** for accessing public transport data.

🔗 **OpenAPI Documentation**: `http://localhost:8000/docs`
