# Tic-Tac-Toe Backend API

## Table of Contents

1. [Introduction](#introduction)
2. [Setup Instructions](#setup-instructions)
3. [Running the Project](#running-the-project)
4. [Building the Project](#building-the-project)
5. [API Endpoints](#api-endpoints)
   - [Start a New Game](#start-a-new-game)
   - [Make a Move](#make-a-move)
   - [Get Game History](#get-game-history)
6. [Database Schema](#database-schema)
7. [Deployment](#deployment)

## Introduction
This project is a backend API for a Tic-Tac-Toe game. The API allows users to start a new game, make moves, and retrieve game history.

## Setup Instructions

1. Clone the repository:
    ```bash
    git clone https://github.com/your-repo/tic-tac-toe-backend.git
    cd tic-tac-toe-backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory with the following content:
    ```
    PORT=3000
    JWT_SECRET=your_jwt_secret
    ```

4. Run the server:
    ```bash
    npm start
    ```

3. The application will automatically handle database creation upon startup. A `database.sqlite` file will be created in the project directory.


## Running the Project

1. Start the server:
    ```bash
    npm start
    ```

2. The server will be available at `http://localhost:3000`.

## Building the Project

To build the project, ensure all dependencies are installed and the environment is correctly configured. Then, you can start the server and interact with the API:

1. Ensure the `.env` file is properly configured with the necessary environment variables.

2. Start the server using:
    ```bash
    npm start
    ```

3. The application will automatically handle database migrations and schema creation upon startup.

## API Endpoints

### Register

Register a new player.

**POST** `/auth/register`

#### Request Body:
```json
{
  "username": "p2",
  "password": "2"
}
```

#### Response:
```json
{
    "message": "User registered",
    "user": {
        "id": 2,
        "username": "p2",
        "password": "$2b$10$oliScgPEKBlwpa99zyKh5ORc1lrzJo9heIaZLz3twqt/St30q37QC",
        "updatedAt": "2025-01-22T08:18:41.218Z",
        "createdAt": "2025-01-22T08:18:41.218Z"
    }
}
```

### Login

Login to a player account.

**POST** `/auth/login`

#### Request Body:
```json
{
  "username": "p1",
  "password": "1"
}
```

#### Response:
```json
{
    "message": "Logged in"
}
```

This sets the jwt auth token in the clients cookies.

### Start a New Game

**POST** `/game/start`

Start a new Tic-Tac-Toe game between two players.

#### Request Body:
```json
{
  "player2Id": "<player2_id>"
}
```

#### Response:
```json
{
  "message": "Game started",
  "gameId": "<game_id>",
  "currentTurn": "<current_player_id>"
}
```

### Make a Move

**POST** `/game/move`

Make a move in an ongoing game.

#### Request Body:
```json
{
  "gameId": "<game_id>",
  "position": <position>
}
```

#### Response:
```json
{
  "message": "Move recorded",
  "game": {
    "id": "<game_id>",
    "currentTurn": "<next_player_id>",
    ...
  }
}
```

### Get Game History

**GET** `game/history`

Retrieve the history of games for the authenticated user.

#### Response:
```json
[
  {
    "gameId": "<game_id>",
    "opponent": "<opponent_username>",
    "result": "<win|lose|draw|ongoing>",
    "moves": [
      {
        "player": "<player1|player2>",
        "position": <position>,
        "time": "<timestamp>"
      },
      ...
    ]
  },
  ...
]
```

## Database Schema

### Tables:

#### Users
| Column    | Type    | Description         |
|-----------|---------|---------------------|
| id        | INTEGER | Primary key         |
| username  | STRING  | Unique user name    |
| password  | STRING  | Hashed password     |

#### Games
| Column     | Type    | Description                  |
|------------|---------|------------------------------|
| id         | INTEGER | Primary key                  |
| player1Id  | INTEGER | Foreign key to Users (player1)|
| player2Id  | INTEGER | Foreign key to Users (player2)|
| currentTurn| INTEGER | Player ID of current turn     |
| status     | STRING  | Game status (ongoing, finished, draw) |
| winnerId   | INTEGER | Foreign key to Users (winner) |

#### Moves
| Column    | Type    | Description                      |
|-----------|---------|----------------------------------|
| id        | INTEGER | Primary key                      |
| gameId    | INTEGER | Foreign key to Games             |
| playerId  | INTEGER | Foreign key to Users (who made the move) |
| position  | INTEGER | Board position (0-8)             |
| createdAt | DATETIME| Timestamp of the move            |

## Migrations

### Creating Tables:

1. **Users Table**:
    ```sql
    CREATE TABLE Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username STRING UNIQUE NOT NULL,
      password STRING NOT NULL
    );
    ```

2. **Games Table**:
    ```sql
    CREATE TABLE Games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1Id INTEGER,
      player2Id INTEGER,
      currentTurn INTEGER,
      status STRING DEFAULT 'ongoing',
      winnerId INTEGER,
      FOREIGN KEY(player1Id) REFERENCES Users(id),
      FOREIGN KEY(player2Id) REFERENCES Users(id),
      FOREIGN KEY(winnerId) REFERENCES Users(id)
    );
    ```

3. **Moves Table**:
    ```sql
    CREATE TABLE Moves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gameId INTEGER,
      playerId INTEGER,
      position INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(gameId) REFERENCES Games(id),
      FOREIGN KEY(playerId) REFERENCES Users(id)
    );
    ```

## Deployment

The backend API is deployed and can be accessed at the following IP address and port:

**IP Address**: `65.1.148.183`  
<!-- **Port**: `3000` -->

### GitHub Workflow for Automated Deployment
(Under development due to time constraints)

Every time a push is made to the `main` branch, the following GitHub Actions workflow will automatically deploy the backend to the EC2 instance:

1. **SSH into EC2**
2. **Stop the running `npm start` process**
3. **Pull the latest changes from GitHub**
4. **Install updated dependencies**
5. **Restart the `npm start` process**

```yaml
name: Deploy to EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout the code
      uses: actions/checkout@v2

    - name: Set up SSH key for EC2 access
      uses: webfactory/ssh-agent@v0.5.3
      with:
        ssh-private-key: ${{ secrets.EC2_KEY }}

    - name: SSH into EC2 and deploy the application
      run: |
        ssh -o StrictHostKeyChecking=no ubuntu@${{ secrets.EC2_HOST }} << 'EOF'
          # Stop the currently running npm server by killing the process
          echo "Stopping existing npm server..."
          pkill -f 'npm start' || true
          
          # Pull the latest changes from the repository
          echo "Pulling the latest code from GitHub..."
          cd /lenden
          git pull origin main
          
           # CD into the server directory
          echo "CD into the server directory..."
          cd /server

          # Install the dependencies
          echo "Installing dependencies..."
          npm install
          
          # Start the server again
          echo "Starting the server..."
          nohup npm start &  # Run npm start in the background
        EOF

