import { useState, useEffect } from "react";
import { Button, Card, Typography, message } from "antd";
import io, { Socket } from "socket.io-client";
import "./App.css";

const { Title } = Typography;

const socket: typeof Socket = io("ws://localhost:3000");

export function App() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [player, setPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);

  useEffect(() => {
    socket.on(
      "updateBoard",
      ({
        newBoard,
        nextPlayer,
      }: {
        newBoard: (string | null)[];
        nextPlayer: "X" | "O";
      }) => {
        setBoard(newBoard);
        setPlayer(nextPlayer);
        setWinner(null);
        setWinningCells([]);
      }
    );

    socket.on(
      "gameOver",
      ({
        winner,
        winningCells,
      }: {
        winner: string | null;
        winningCells: number[];
      }) => {
        setWinner(winner);
        setWinningCells(winningCells);
        message.success(winner ? `O jogador ${winner} venceu!` : "Empate!");
      }
    );
  }, []);

  function handleClick(index: number) {
    if (!board[index] && !winner) {
      socket.emit("play", { index, player });
    }
  }

  function newGame() {
    socket.emit("newGame");
    setWinner(null);
    setBoard(Array(9).fill(null));
    setWinningCells([]);
  }
  return (
    <Card style={{ width: 300, textAlign: "center" }}>
      <Title level={3}>Jogo da Velha</Title>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 5,
        }}
      >
        {board.map((cell, index) => (
          <Button
            key={index}
            style={{
              height: 60,
              fontSize: 24,
              backgroundColor: winningCells.includes(index)
                ? "#4CAF50"
                : undefined,
              color: winningCells.includes(index) ? "white" : undefined,
            }}
            onClick={() => handleClick(index)}
          >
            {cell}
          </Button>
        ))}
      </div>
      {winner && (
        <>
          <Title level={4}>
            {winner === "Empate" ? "Empate!" : `Vencedor: ${winner}`}
          </Title>
          <Button onClick={newGame}>Reiniciar partida</Button>
        </>
      )}
    </Card>
  );
}
