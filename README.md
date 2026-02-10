# AnnSparsh - Food Waste Reduction Platform 🍲

**AnnSparsh** ("Touch of Food") is a web platform designed to bridge the gap between food abundance and hunger. It connects food donors (restaurants, hotels, individuals) with NGOs and volunteers to facilitate the efficient redistribution of surplus food.

![AnnSparsh Hero](https://lh3.googleusercontent.com/aida-public/AB6AXuDAyEFGPRA45ivjUjsP21WZ3IeGMXdAjumuWw1aN4pGLvkzZNNnnvjRbh8imjuKVRSjVUPPsMl2RaYbVnPeWdOXPMLzYrws6M031BR5s_NmIsZbyE6gViSSftO8e9LqTZ8vDMtv5az1wt6ypCwE4qQJGCSqw08aHgRwtz1F5qbe3M3wuT_0Ik6VwLhvvKJjV6Ozs7yS9OiR-ScoiI7cf93mxibETI9a-TOkx1Jw97KjpuMDmicDjqWe_YRt_MVyEOAmbIYf4bnDlcw)

## 🚀 Key Features

*   **User Roles**: Distinct flows for **Donors**, **NGOs/Volunteers**, and **Administrators**.
*   **Donation Management**: Easy-to-use form to list surplus food types, quantities, and pickup details.
*   **Real-time Tracking**: Live status tracking of food donations from request to delivery.
*   **Interactive Dashboards**:
    *   **Donor Dashboard**: Manage active donations and view impact stats.
    *   **NGO Dashboard**: detailed feed of available food in the vicinity.
    *   **Admin Dashboard**: Oversee platform activity and verify organizations.
*   **Impact Reporting**: Visual statistics on meals saved, CO2 reduced, and lives impacted.
*   **Responsive Design**: Fully responsive UI built with Tailwind CSS for mobile and desktop.

## 🛠️ Tech Stack

*   **Frontend**: React.js (Vite)
*   **Styling**: Tailwind CSS, Vanilla CSS (for custom animations)
*   **Routing**: React Router DOM
*   **Icons**: Google Material Symbols
*   **Fonts**: Be Vietnam Pro, Public Sans

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Nitin23123/Annsparsh.git
    cd Annsparsh
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:5173` to view the application.

## 🚦 Usage Flows

### 1. Donor Flow
*   Login and select **"Donate Food"**.
*   Use the dashboard to **"Add Food Donation"**.
*   Track the status of your donation under **"My Donations"**.

### 2. NGO Flow
*   Login and select **"Request Food"**.
*   Browse the **"Available Food"** feed on the dashboard.
*   Click **"Request Food"** to claim a donation.

### 3. Admin Flow
*   Click **"Login as Administrator"** on the Role Selection page (bottom link).
*   View platform statistics and approve/reject verification requests.

## 📂 Project Structure

```
src/
├── components/        # All React components (Pages & UI elements)
│   ├── Auth.jsx       # Login/Register page
│   ├── DonorDashboard.jsx
│   ├── NGODashboard.jsx
│   ├── CreateDonation.jsx
│   ├── History.jsx    # Impact reports
│   └── ...
├── App.jsx            # Main routing configuration
├── index.css          # Tailwind imports & global animations
└── main.jsx           # Entry point
```

## 🎨 Design System

*   **Primary Color**: `#f28e02` (Orange)
*   **Brand Green**: `#115741` (Deep Forest Green)
*   **Background**: `#fdf3e4` (Warm Cream)

---
*Built with ❤️ for a hunger-free world.*
