# 🎸 Ruleta del Rock - Smart Probability Roulette

A modern web application featuring an intelligent roulette system with weighted probabilities that adapts based on selection history. Perfect for fair team selections, games, or any scenario where you need smart randomization.

## 🎯 Features

- **Smart Probability System**: Winners get reduced chances in future spins, others get increased chances
- **Real-time Statistics**: Visual probability bars and selection counts
- **Persistent Data**: All participants and statistics survive application restarts
- **Responsive UI**: Modern React interface with smooth animations
- **Backend Integration**: RESTful API with H2 database persistence
- **Fallback Mode**: Works offline with equal probabilities when backend is unavailable

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API communication
- **CSS3** - Custom styling with animations

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Application framework
- **Spring Data JPA** - Data persistence layer
- **H2 Database** - Embedded database (file-based for persistence)
- **Gradle** - Build tool and dependency management
- **Lombok** - Code generation for cleaner Java

## 📋 Prerequisites

Before running this application locally, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Java 17** - [Download here](https://adoptium.net/)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd test-project
```

### 2. Backend Setup (Spring Boot)

Navigate to the backend directory:
```bash
cd ruleta-backend
```

Build and run the backend:
```bash
./gradlew bootRun
```

The backend will start on `http://localhost:8080`

**Alternative commands:**
```bash
# Clean build
./gradlew clean build

# Run tests
./gradlew test

# Build without tests
./gradlew build -x test
```

### 3. Frontend Setup (React)

Open a new terminal and navigate to the frontend directory:
```bash
cd ruleta-front
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5174`

**Alternative commands:**
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Use

1. **Add Participants**: Enter names using the input field
2. **Spin the Roulette**: Click the "Spin" button when you have 2+ participants
3. **View Statistics**: Check the probability bars and selection counts on the right panel
4. **Reset Statistics**: Use the "Resetear Estadísticas" button to reset all weights to equal
5. **Remove Participants**: Click the ❌ button next to any participant (with confirmation)

## 🔧 Configuration

### Backend Configuration
The backend configuration is located in `ruleta-backend/app/src/main/resources/application.yml`:

- **Database**: H2 file-based database stored in `./data/ruletadb`
- **CORS**: Configured for frontend ports 5173 and 5174
- **Logging**: Configured for development debugging

### Frontend Configuration
The frontend API configuration is in `ruleta-front/src/services/api.js`:

- **API Base URL**: `http://localhost:8080/api/roulette`
- **Auto-refresh**: Statistics refresh every 10 seconds

## 📊 API Endpoints

- `GET /api/roulette/participants` - Get all active participants
- `POST /api/roulette/participants?name={name}` - Add or reactivate participant
- `DELETE /api/roulette/participants/{name}` - Remove participant (soft delete)
- `POST /api/roulette/record-winner` - Record winner and update probabilities
- `POST /api/roulette/reset` - Reset all statistics
- `GET /api/roulette/health` - Health check

## 🎲 Probability Algorithm

The smart probability system works as follows:

1. **Initial State**: All participants start with equal probability (weight = 1.0)
2. **Winner Selection**: When someone is selected:
   - Winner's weight is reduced by 50% (×0.5)
   - All others' weights increase by 10% (×1.1)
3. **Constraints**: 
   - Minimum weight: 0.1 (ensures everyone has a chance)
   - Maximum weight: 3.0 (prevents extreme dominance)
4. **Persistence**: All weights and statistics are saved to database

## 🐛 Troubleshooting

### Backend Issues
- **Port 8080 in use**: Kill the process or change the port in `application.yml`
- **Java version**: Ensure Java 17 is installed and set as default
- **Database locked**: Delete `./data/ruletadb.*` files and restart

### Frontend Issues
- **Port 5174 in use**: Vite will automatically suggest an alternative port
- **API connection failed**: Ensure backend is running on port 8080
- **Dependencies issues**: Delete `node_modules` and run `npm install` again

### General Issues
- **CORS errors**: Check that frontend URL is added to backend CORS configuration
- **Data not persisting**: Verify write permissions in the `data/` directory

## 📝 Development Notes

- The application uses a "soft delete" approach - participants are marked as inactive rather than deleted
- Statistics are calculated in real-time and cached for performance
- The frontend has a fallback mode that works without backend connectivity
- All database operations are transactional to ensure data consistency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Made with ❤️ for fair and fun selections! 