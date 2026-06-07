import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameBoard from "../components/GameBoard";

const emitMock = vi.fn();

vi.mock("../socket", () => ({
    default: {
        emit: emitMock,
    },
}));

const questions = [
    {
        id: "q1",
        category: "History",
        value: 100,
        text: "Question 1",
        used: false,
    },
    {
        id: "q2",
        category: "History",
        value: 200,
        text: "Question 2",
        used: false,
    },
    {
        id: "q3",
        category: "Science",
        value: 100,
        text: "Question 3",
        used: true,
    },
    {
        id: "q4",
        category: "Science",
        value: 200,
        text: "Question 4",
        used: false,
    },
];

describe("GameBoard", () => {
    beforeEach(() => {
        emitMock.mockClear();
    });

    it("renders categories", () => {
        render(<GameBoard questions={questions} roomCode="ABC123" disabled={false} />);

        expect(screen.getByText("History")).toBeInTheDocument();
        expect(screen.getByText("Science")).toBeInTheDocument();
    });

    it("renders available money values", () => {
        render(<GameBoard questions={questions} roomCode="ABC123" disabled={false} />);

        expect(screen.getAllByText("$100").length).toBeGreaterThan(0);
        expect(screen.getAllByText("$200").length).toBeGreaterThan(0);
    });

    it("emits selectQuestion when a tile is clicked", async () => {
        const user = userEvent.setup();

        render(<GameBoard questions={questions} roomCode="ABC123" disabled={false} />);

        await user.click(screen.getAllByText("$100")[0]);

        expect(emitMock).toHaveBeenCalledWith("selectQuestion", {
            roomCode: "ABC123",
            questionId: "q1",
        });
    });
});