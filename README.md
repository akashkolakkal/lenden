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

### Start a New Game

**POST** `/start`

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

**POST** `/move`

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

**GET** `/history`

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

