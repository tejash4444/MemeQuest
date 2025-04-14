# MemeQuest

**MemeQuest** is a meme-themed interactive web app built with a modern tech stack. The frontend is built with React and Tailwind CSS, while the backend is powered by Python. This project is designed to offer a fun and dynamic experience by combining user interaction with meme-based content.

---

## 📁 Project Structure

```
MemeQuest-main/
└── moodbot-template/
    ├── public/               # Static files for the frontend
    ├── src/                  # React app source code
    ├── server/               # Python backend (API)
    ├── package.json          # Frontend dependencies
    ├── requirements.txt      # Backend dependencies
    ├── tailwind.config.js    # Tailwind configuration
    └── postcss.config.js     # PostCSS setup
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/MemeQuest.git
cd MemeQuest-main/moodbot-template
```

---

## 🖥️ Frontend Setup (React + Tailwind)

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

The app will be running at [http://localhost:3000](http://localhost:3000).

---

## 🔌 Backend Setup (Python)

### Set Up Virtual Environment

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Run the Backend Server

```bash
python app.py
```

By default, the server runs at [http://localhost:5000](http://localhost:5000).

---

## 🔗 Connecting Frontend and Backend

Ensure both the frontend and backend are running. API calls from the frontend (e.g., using `fetch` or `axios`) should point to `http://localhost:5000`.

You may need to enable CORS in the backend if you're calling it from the frontend during development.

---

## 📦 Building for Production

```bash
npm run build
```

This will generate a production-ready build in the `build/` directory.

---

## 🧰 Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Python (Flask or similar)
- **Tools**: Node.js, npm, Python 3, Virtualenv

---

## 📜 License

This project is open-source and available under the MIT License.
