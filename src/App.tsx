import { useState, useEffect } from "react";

interface City {
  name: string;
  lat: number;
  lng: number;
  silhouette: string;
}

const cities: City[] = [
  {
    name: "København",
    lat: 55.6761,
    lng: 12.5683,
    silhouette:
      "M50,200 L100,180 L120,110 L150,100 L170,120 L190,90 L220,95 L240,130 L260,110 L290,150 L310,140 L330,190 L350,200 L350,250 L50,250 Z",
  },
  {
    name: "Aarhus",
    lat: 56.1629,
    lng: 10.2039,
    silhouette:
      "M50,200 L80,180 L100,150 L140,160 L180,120 L200,130 L230,100 L270,110 L290,150 L310,140 L330,170 L350,200 L350,250 L50,250 Z",
  },
  {
    name: "Odense",
    lat: 55.4038,
    lng: 10.4024,
    silhouette:
      "M50,200 L90,190 L130,170 L150,140 L180,160 L210,130 L240,150 L270,120 L300,140 L320,170 L350,200 L350,250 L50,250 Z",
  },
  {
    name: "Aalborg",
    lat: 57.0488,
    lng: 9.9217,
    silhouette:
      "M50,200 L80,190 L110,150 L140,160 L160,130 L190,120 L220,140 L250,120 L280,150 L310,160 L330,190 L350,200 L350,250 L50,250 Z",
  },
  {
    name: "Esbjerg",
    lat: 55.4765,
    lng: 8.4594,
    silhouette:
      "M50,200 L70,190 L100,180 L130,150 L160,160 L200,140 L230,150 L260,130 L290,140 L310,160 L330,190 L350,200 L350,250 L50,250 Z",
  },
];

type CompassDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
type DirectionMap = Record<CompassDirection, string>;

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getCompassDirection(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): CompassDirection {
  const dLon = lon2 - lon1;
  const y = Math.sin((dLon * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos((dLon * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  const direction = (bearing + 360) % 360;

  const directions: CompassDirection[] = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW",
  ];
  const index = Math.round(direction / 45) % 8;
  return directions[index];
}

function formatDirection(direction: CompassDirection): string {
  const directionMap: DirectionMap = {
    N: "Nord",
    NE: "Nordøst",
    E: "Øst",
    SE: "Sydøst",
    S: "Syd",
    SW: "Sydvest",
    W: "Vest",
    NW: "Nordvest",
  };

  return directionMap[direction] || direction;
}

interface CitySilhouetteProps {
  secretCity: City;
}

function CitySilhouette({ secretCity }: CitySilhouetteProps) {
  return (
    <div
      style={{
        height: "300px",
        width: "100%",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 400 300">
        <rect x="0" y="0" width="400" height="250" fill="#87CEEB" />
        <circle cx="320" cy="50" r="30" fill="#FFD700" />
        <path d={secretCity.silhouette} fill="black" />
        <rect x="0" y="250" width="400" height="50" fill="#8B4513" />
      </svg>
    </div>
  );
}

interface Guess {
  city: string;
  distance: number;
  direction: string;
}

interface GameStats {
  rounds: number;
  wins: number;
}

export default function App() {
  const [secretCity, setSecretCity] = useState<City | null>(null);
  const [guess, setGuess] = useState<string>("");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStats, setGameStats] = useState<GameStats>({ rounds: 0, wins: 0 });

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const random = cities[Math.floor(Math.random() * cities.length)];
    setSecretCity(random);
    console.log("The secret city is:", random.name);
    setGuess("");
    setGuesses([]);
    setGameOver(false);
  };

  const handleGuess = () => {
    if (!secretCity || !guess) return;
    const guessedCity = cities.find((c) => c.name === guess);
    if (!guessedCity) return;

    const distance = calculateDistance(
      secretCity.lat,
      secretCity.lng,
      guessedCity.lat,
      guessedCity.lng,
    );

    const direction = getCompassDirection(
      guessedCity.lat,
      guessedCity.lng,
      secretCity.lat,
      secretCity.lng,
    );

    const newGuess = {
      city: guessedCity.name,
      distance,
      direction: formatDirection(direction),
    };

    const updatedGuesses = [...guesses, newGuess];
    setGuesses(updatedGuesses);

    const isCorrect = guessedCity.name === secretCity.name;

    if (isCorrect || updatedGuesses.length >= 10) {
      setGameOver(true);
      setGameStats((prev) => ({
        rounds: prev.rounds + 1,
        wins: prev.wins + (isCorrect ? 1 : 0),
      }));
    }

    setGuess("");
  };

  const getClosestGuess = (): number | null => {
    if (guesses.length === 0) return null;
    return Math.min(...guesses.map((g) => g.distance));
  };

  const closestDistance = getClosestGuess();

  const containerStyle = {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px",
    fontFamily: "Roboto, sans-serif",
  };

  const selectStyle = {
    flexGrow: 1,
    padding: "10px",
    border: "1px solid #c4c4c4",
    borderRadius: "4px",
    fontSize: "16px",
  };

  const buttonStyle = {
    padding: "10px 16px",
    backgroundColor: !guess || gameOver ? "#e0e0e0" : "#1976d2",
    color: !guess || gameOver ? "#9e9e9e" : "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "500",
    cursor: !guess || gameOver ? "not-allowed" : "pointer",
    fontSize: "16px",
    marginLeft: "8px",
  };

  const guessListTitleStyle = {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    marginTop: "20px",
  };

  const guessItemStyle = (isCorrect: boolean) => ({
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    borderRadius: "4px",
    border: `1px solid ${isCorrect ? "#a5d6a7" : "#e0e0e0"}`,
    backgroundColor: isCorrect ? "#e8f5e9" : "transparent",
    marginBottom: "8px",
  });

  const gameOverTitleStyle = (isCorrect: boolean) => ({
    fontSize: "20px",
    fontWeight: "bold",
    color: isCorrect ? "#4caf50" : "#f44336",
  });

  const playAgainButtonStyle = {
    marginTop: "16px",
    padding: "10px 24px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  };

  return (
    <div style={containerStyle}>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          textAlign: "center",
          margin: "0 0 8px 0",
          color: "#1976d2",
        }}
      >
        ByGætteren
      </h1>
      <p
        style={{
          fontSize: "16px",
          textAlign: "center",
          color: "#757575",
          marginBottom: "24px",
        }}
      >
        Gæt den danske by ud fra silhuetten
      </p>

      {secretCity && (
        <div style={{ marginBottom: "24px" }}>
          <CitySilhouette secretCity={secretCity} />
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <select
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={gameOver}
          style={selectStyle as React.CSSProperties}
        >
          <option value="">Vælg en by</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleGuess}
          disabled={!guess || gameOver}
          style={buttonStyle as React.CSSProperties}
        >
          Gæt
        </button>
      </div>

      {guesses.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2 style={guessListTitleStyle}>Dine gæt: ({guesses.length}/10)</h2>
          <div>
            {guesses.map((g, index) => (
              <div
                key={index}
                style={guessItemStyle(g.distance === 0) as React.CSSProperties}
              >
                <span
                  style={{ fontWeight: g.distance === 0 ? "bold" : "normal" }}
                >
                  {g.city}
                </span>
                <span>
                  {g.distance.toFixed(1)} km {g.direction}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameOver && (
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            padding: "16px",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            backgroundColor: "#fafafa",
          }}
        >
          {secretCity !== null && (
            <>
              <h2
                style={
                  gameOverTitleStyle(
                    guesses.some((g) => g.distance === 0),
                  ) as React.CSSProperties
                }
              >
                {guesses.some((g) => g.distance === 0)
                  ? "Tillykke! Du gættede rigtigt!"
                  : `Den hemmelige by var: ${secretCity.name}`}
              </h2>
            </>
          )}

          {closestDistance !== null && closestDistance > 0 && (
            <p style={{ fontSize: "14px", color: "#757575", marginTop: "8px" }}>
              Din tætteste gæt var {closestDistance.toFixed(1)} km væk
            </p>
          )}

          <button onClick={startNewGame} style={playAgainButtonStyle}>
            Spil igen
          </button>

          <p style={{ fontSize: "14px", color: "#757575", marginTop: "16px" }}>
            Statistik: {gameStats.wins} vundet af {gameStats.rounds} spil
          </p>
        </div>
      )}
    </div>
  );
}
