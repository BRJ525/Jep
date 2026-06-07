import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Scoreboard from "../components/Scoreboard";

vi.mock("../assets/coin.png", () => ({
    default: "coin.png",
}));

describe("Scoreboard", () => {
    const players = [
        { id: "p1", name: "Brandon", score: 300 },
        { id: "p2", name: "Alex", score: 100 },
    ];

    it("renders the scoreboard title", () => {
        render(<Scoreboard players={players} />);

        expect(screen.getByText(/scores/i)).toBeInTheDocument();
    });

    it("renders player names", () => {
        render(<Scoreboard players={players} />);

        expect(screen.getByText("Brandon")).toBeInTheDocument();
        expect(screen.getByText("Alex")).toBeInTheDocument();
    });

    it("renders player scores", () => {
        render(<Scoreboard players={players} />);

        expect(screen.getByText("300")).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
    });
});