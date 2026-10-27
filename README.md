# ParkWatch 🚔

**ParkWatch** is a modern, intelligent illegal-parking detection and citizen-reporting platform designed for Smart Cities. It empowers citizens to report traffic violations using AI, and gives traffic authorities a powerful dashboard to manage, verify, and penalize repeat offenders.

---

## 🚀 Features

### For Citizens
* **AI-Assisted Reporting Wizard**: A smooth 4-step wizard to report violations.
* **YOLOv8 Vehicle Detection**: Automatically verifies if the uploaded evidence contains a vehicle.
* **OpenCV + Tesseract OCR**: Automatically extracts the vehicle number plate from the image.
* **Location Intelligence**: Interactive OpenStreetMap (React Leaflet) to pinpoint the exact violation location without relying on Google Maps.
* **Citizen Dashboard**: Track the status of your reported violations in real-time.

### For Authorities
* **Admin Dashboard**: Sleek interface with KPI metrics and data visualizations (Recharts).
* **Automated Priority Scoring**: The system automatically assigns a HIGH/MEDIUM/LOW priority score based on violation severity (e.g., blocking an ambulance) and repeat offender history.
* **Repeat Offender Detection**: The backend searches historical records using normalized license plates to catch serial offenders.
* **Fine Management**: Generate official fine records seamlessly.
* **Email Notifications**: Automated email updates sent to citizens when their report status changes or a fine is issued.
* **Audit Logs**: Immutable MongoDB audit trails for all critical admin actions.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), React Router, Vanilla CSS (Custom Design System), Recharts, React-Leaflet
* **AI/ML**: ONNX Runtime Web (YOLOv8), OpenCV.js, Tesseract.js
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **Storage**: Cloudinary (for image evidence)
* **Security**: Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, JWT Authentication

---

## ⚙️ Installation & Setup

### 1. Prerequisites
* Node.js (v18+)
* MongoDB (Local or Atlas)
* Cloudinary Account

### 2. Backend Setup
\`\`\`bash
cd server
npm install
\`\`\`
Create a \`.env\` file in the \`server\` directory:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.mailtrap.io
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_pass
\`\`\`
Start the backend:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd client
npm install
\`\`\`
Place your YOLOv8 ONNX model (\`yolov8n.onnx\`) inside the \`client/public/models/\` directory.
Start the frontend:
\`\`\`bash
npm run dev
\`\`\`

---

## 🔒 Security Architecture
ParkWatch is hardened against common web vulnerabilities:
- **NoSQL Injection Protection**: \`express-mongo-sanitize\` strips prohibited characters.
- **Brute Force Protection**: \`express-rate-limit\` throttles API requests.
- **Header Security**: \`helmet\` enforces strict HTTP headers.
- **Auth**: Stateless JWT-based authentication with Role-Based Access Control (RBAC).

---

## 📜 License
This project is created for academic/demonstration purposes as part of a Smart City initiative.
