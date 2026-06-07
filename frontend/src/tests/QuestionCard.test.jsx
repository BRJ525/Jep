import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuestionCard from "../components/QuestionCard";

const emitMock = vi.fn();

vi.mock("../socket", () => ({
    default: {
        id: "player-1",
        emit: emitMock,
    },
}));

const question = {
    id: "q1",
    category: "History",
    value: 100,
    text: "Who was the first president?",
    options: ["George Washington", "John Adams", "Thomas Jefferson", "Abe Lincoln"],
    answer: "George Washington",
};

function makeRoom(overrides = {}) {
    return {
        players: [
            {
                id: "player-1",
                name: "Brandon",
                score: 0,
                selectedAnswer: null,
            },
            {
                id: "player-2",
                name: "Alex",
                score: 0,
                selectedAnswer: null,
            },
        ],
        currentCorrectPlayerId: null,
        hasQuestionBeenAnswered: false,
        ...overrides,
    };
}

describe("QuestionCard", () => {
    beforeEach(() => {
        emitMock.mockClear();
    });

    it("renders the question category, value, and text", () => {
        render(
            <QuestionCard
                question={question}
                room={makeRoom()}
                roomCode="ABC123"
                isHost={false}
            />
        );

        expect(screen.getByText(/history/i)).toBeInTheDocument();
        expect(screen.getByText(/\$100/i)).toBeInTheDocument();
        expect(screen.getByText("Who was the first president?")).toBeInTheDocument();
    });

    it("renders all answer options", () => {
        render(
            <QuestionCard
                question={question}
                room={makeRoom()}
                roomCode="ABC123"
                isHost={false}
            />
        );

        expect(screen.getByText("George Washington")).toBeInTheDocument();
        expect(screen.getByText("John Adams")).toBeInTheDocument();
        expect(screen.getByText("Thomas Jefferson")).toBeInTheDocument();
        expect(screen.getByText("Abe Lincoln")).toBeInTheDocument();
    });

    it("emits submitAnswer when an answer is clicked", async () => {
        const user = userEvent.setup();

        render(
            <QuestionCard
                question={question}
                room={makeRoom()}
                roomCode="ABC123"
                isHost={false}
            />
        );

        await user.click(screen.getByText("George Washington"));

        expect(emitMock).toHaveBeenCalledWith("submitAnswer", {
            roomCode: "ABC123",
            selectedAnswer: "George Washington",
        });
    });

    it("shows the selected answer text when the player has answered", () => {
        const room = makeRoom({
            players: [
                {
                    id: "player-1",
                    name: "Brandon",
                    score: 0,
                    selectedAnswer: "John Adams",
                },
            ],
        });

        render(
            <QuestionCard
                question={question}
                room={room}
                roomCode="ABC123"
                isHost={false}
            />
        );

        expect(screen.getByText(/you answered/i)).toBeInTheDocument();
        expect(screen.getByText("John Adams")).toBeInTheDocument();
    });

    it("shows the correct player when the question has been answered", () => {
        const room = makeRoom({
            currentCorrectPlayerId: "player-2",
            hasQuestionBeenAnswered: true,
        });

        render(
            <QuestionCard
                question={question}
                room={room}
                roomCode="ABC123"
                isHost={false}
            />
        );

        expect(screen.getByText(/Alex answered first/i)).toBeInTheDocument();
    });

    it("shows next question button for host", () => {
        render(
            <QuestionCard
                question={question}
                room={makeRoom()}
                roomCode="ABC123"
                isHost={true}
            />
        );

        expect(screen.getByRole("button", { name: /next question/i })).toBeInTheDocument();
    });

    it("emits closeQuestion when host clicks next question", async () => {
        const user = userEvent.setup();

        render(
            <QuestionCard
                question={question}
                room={makeRoom()}
                roomCode="ABC123"
                isHost={true}
            />
        );

        await user.click(screen.getByRole("button", { name: /next question/i }));

        expect(emitMock).toHaveBeenCalledWith("closeQuestion", {
            roomCode: "ABC123",
        });
    });
});