# 🚗 RideBridge – Intercity Ride Sharing Platform

RideBridge Frontend is the cross-platform client application for the RideBridge Intercity Ride Sharing Platform. Built with React Native (Expo) and TypeScript, it enables riders and drivers to securely search, create, and manage rides while communicating with the RideBridge backend through REST APIs.

---

## ✨ Features

- 🔐 Secure JWT Authentication
- 📧 Email Verification & Password Reset (Brevo + Nodemailer)
- 📱 OTP Verification using Twilio
- 🪪 Driver KYC Verification using Setu DigiLocker APIs
- 🚗 Search, Create & Book Intercity Rides
- 💳 Razorpay Payment Gateway Integration
- 📍 Live Driver Location Sharing
- 🎫 Seat Selection & Booking Management
- ⭐ Ratings & Reviews
- 👤 Driver Dashboard
- 📲 Cross-platform Support (Android • iOS • Web)

---

# 🛠️ Tech Stack

## Frontend

- React Native (Expo)
- Expo Router
- TypeScript
- Axios

## Backend

- Node.js
- Express.js
- TypeScript
- REST APIs
- JWT Authentication

## Database

- PostgreSQL
- Prisma ORM

## Third-Party Services

- Razorpay
- Twilio
- Setu DigiLocker APIs
- Brevo
- Nodemailer

## Deployment

- Render

# 📂 Project Structure

```text
RideBridge-Frontend/
│
├── app/
│   ├── (auth)/                 # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── verify-otp.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   │
│   ├── (app)/                  # Protected application routes
│   │   ├── home.tsx
│   │   ├── post-ride.tsx
│   │   ├── my-listings.tsx
│   │   ├── bookings/
│   │   ├── listing/
│   │   ├── user/
│   │   ├── profile.tsx   
│   │   └── kyc.tsx
│   │
│   ├── _layout.tsx
│   └── index.tsx
│
├── src/
│   ├── api/                    # API service layer
│   ├── components/             # Reusable UI components
│   ├── context/                # Authentication Context
│   ├── theme/                  # Design system
│   ├── types/                  # TypeScript interfaces
│   └── utils/                  # Utility functions
│
├── assets/
├── package.json
└── README.md
```

# 🏗️ Frontend Architecture

```text
                           ┌─────────────────────────┐
                           │     User (Mobile/Web)   │
                           └─────────────┬───────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────┐
                    │     React Native (Expo App)     │
                    │  Android • iOS • Web Platform   │
                    └─────────────┬───────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │       Expo Router         │
                    │    File-Based Routing     │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼────────────────────────┐
          ▼                       ▼                        ▼
 ┌────────────────┐     ┌────────────────┐      ┌────────────────┐
 │ Auth Context   │     │  Global State  │      │ UI Components  │
 │ JWT Session    │     │                │      │ Reusable Views │
 └───────┬────────┘     └───────┬────────┘      └────────────────┘
         │                      │
         └──────────────┬───────┘
                        ▼
              ┌────────────────────┐
              │ Axios API Client   │
              │ Auth Interceptors  │
              └─────────┬──────────┘
                        │
                  REST API Calls
                        │
                        ▼
          ┌────────────────────────────┐
          │   RideBridge Backend API   │
          └────────────────────────────┘
```

---

# 📸 Screenshots

| Login | Home |
|-------|------|
| <img width="1910" height="891" alt="image" src="https://github.com/user-attachments/assets/9fbe7894-b67a-4495-8804-4d9aec84d5ed" /> | <img width="1886" height="891" alt="image" src="https://github.com/user-attachments/assets/1571cd86-d300-4ead-b29e-8827fa13ee71" /> |

| Ride Details | Booking |
|--------------|---------|
| <img width="1897" height="898" alt="image" src="https://github.com/user-attachments/assets/7656e9c9-f271-46d2-8255-7867e998cefb" /> | <img width="1900" height="896" alt="image" src="https://github.com/user-attachments/assets/d8837ac4-fcf7-410a-84c8-434223d77b1e" /> |

| Payment | Driver Dashboard |
|---------|------------------|
| <img width="1898" height="896" alt="image" src="https://github.com/user-attachments/assets/430541de-6b24-4840-bd19-a1e033428f49" /> | <img width="1886" height="897" alt="image" src="https://github.com/user-attachments/assets/411b4684-a038-4d5f-8aa0-2d23c4175282" /> |

| Profile | KYC Verification |
|---------|------------------|
| <img width="1893" height="897" alt="image" src="https://github.com/user-attachments/assets/319739c9-05a1-4f1a-8cfc-311a5e5c7487" /> | <img width="1888" height="901" alt="image" src="https://github.com/user-attachments/assets/a4b9c779-d482-4ca5-a854-42b556c75af2" /> |

---

# 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/RideBridge-Frontend.git

# Navigate to project
cd RideBridge-Frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start Expo
npx expo start
```

---

# ⚙️ Environment Variables

Create a `.env` file and configure:

```env
EXPO_PUBLIC_API_URL=YOUR_BACKEND_URL
```

---

# 📦 Backend Repository

🔗 https://github.com/Ankitkumar445/ridebridge-backend-v2

---

# 🔮 Future Improvements

- Real-time notifications using Socket.IO
- Push Notifications
- AI-based Ride Recommendations
- Dynamic Pricing Engine
- In-app Chat between Driver & Passenger
- Ride History Analytics
- Dark Mode Support

---

# 👨‍💻 Author

**Ankit Kumar**

- LinkedIn: https://www.linkedin.com/in/ankit-kumar-035083304/
- Portfolio: https://selfprofile-phi.vercel.app/
- GitHub: https://github.com/Ankitkumar445


