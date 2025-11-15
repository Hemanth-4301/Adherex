# Adherex Backend - Node.js Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6.0+ (running locally or cloud)
- Git

### Installation Steps

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (edit `.env`):
   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/adherex
   MAIL_USER=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   GEMINI_API_KEY=your-gemini-api-key
   ```

5. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📋 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/adherex` |
| `MAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USER` | Email address | `your-email@gmail.com` |
| `MAIL_PASSWORD` | App-specific password | See Gmail setup below |
| `GEMINI_API_KEY` | Google Gemini AI key | Get from Google AI Studio |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:3000` |

## 🔧 Configuration Details

### Gmail SMTP Setup
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password: Account → Security → 2-Step Verification → App passwords
4. Use the generated 16-character password in `MAIL_PASSWORD`

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: Follow official docs

# Start MongoDB
mongod --dbpath /path/to/data
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create free account at mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Google Gemini API Key
1. Visit https://aistudio.google.com/
2. Create API key
3. Copy to `GEMINI_API_KEY` in `.env`

## 🗂️ Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   ├── emailService.js      # Nodemailer configuration
│   └── geminiService.js     # Google Gemini AI setup
├── models/
│   ├── Patient.js           # Patient schema
│   ├── Medication.js        # Medication schema
│   └── Consumed.js          # Consumption tracking schema
├── routes/
│   ├── patientRoutes.js     # Patient endpoints
│   ├── medicationRoutes.js  # Medication endpoints
│   ├── consumedRoutes.js    # Consumption endpoints
│   └── geminiRoutes.js      # AI chat endpoints
├── .env.example             # Environment template
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
└── server.js                # Main application
```

## 🔌 API Endpoints

### Patient Routes
- `POST /register` - Register new patient
- `POST /login` - Login (patient or caretaker)
- `GET /getById/:id` - Get patient by ID
- `PUT /update/:id` - Update patient
- `PUT /setAlert/:id` - Set alert
- `PUT /clearAlert/:id` - Clear alert

### Medication Routes
- `POST /medications/add/:patientId` - Add medication
- `GET /medications/get/patient/:patientId` - Get patient medications
- `PUT /medications/update/:mid` - Update medication
- `DELETE /medications/delete/:mid` - Delete medication

### Consumed Routes
- `GET /consumed/bypatient/:p_id` - Get consumption history
- `POST /consumed/add` - Add consumption record

### AI Routes
- `POST /api/gemini/medication/ask` - Chat with AI assistant

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Adherex Backend Server is running",
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

### Test Registration
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test@example.com",
    "password": "test123",
    "careTakerEmail": "caretaker@example.com"
  }'
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
```bash
mongod --dbpath /path/to/data
```

### Email Sending Fails
```
Error: Invalid login
```
**Solution**: Use App Password, not regular Gmail password

### Port Already in Use
```
Error: listen EADDRINUSE :::8080
```
**Solution**: Change port in `.env` or kill process using port 8080
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8080
kill -9 <PID>
```

## 📊 Database Schema

### Patients Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String,
  description: String,
  bp: String,
  regularDoctor: String,
  careTakerEmail: String,
  alert: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Medications Collection
```javascript
{
  _id: ObjectId,
  tableName: String,
  tabletQty: Number,
  timing: String,
  doctor: String,
  patient: ObjectId (ref: Patient),
  createdAt: Date,
  updatedAt: Date
}
```

### Consumeds Collection
```javascript
{
  _id: ObjectId,
  dateTime: Date,
  medication: ObjectId (ref: Medication),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Notes

⚠️ **Important for Production**:

1. **Never commit `.env` file**
2. **Use bcrypt for password hashing**:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hashedPassword = await bcrypt.hash(password, 10);
   ```
3. **Implement JWT authentication**
4. **Add rate limiting**:
   ```bash
   npm install express-rate-limit
   ```
5. **Use HTTPS in production**
6. **Validate all inputs**
7. **Sanitize user data**

## 🚀 Deployment

### Deploy to Heroku
```bash
heroku create adherex-backend
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set GEMINI_API_KEY=your-key
git push heroku main
```

### Deploy to Railway
```bash
railway init
railway add
railway up
```

### Deploy to Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy

## 📝 Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (when implemented)
npm test
```

## 🔄 Migration from Spring Boot

### Key Differences
1. **IDs**: MongoDB uses `_id` (ObjectId) instead of integer `pid`, `mid`, `cid`
2. **Timestamps**: Automatic `createdAt` and `updatedAt` fields
3. **Relationships**: Mongoose references instead of JPA `@ManyToOne`
4. **Query Syntax**: MongoDB queries instead of SQL
5. **Async/Await**: All database operations are asynchronous

### Frontend Updates Required
- Update session storage to use `_id` instead of `pid`
- Already done in `Login.js`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📞 Support

For issues or questions:
- Check troubleshooting section
- Review API documentation
- Create GitHub issue

---

**Happy coding! 🎉**
