import { describe, it, expect } from "vitest";
import Player from "../models/Player.js";
import {
    createRoomCode,
    createRoom,
    isRoomHost,
    findRoom,
    addPlayerToRoom,
    selectQuestion,
    submitAnswer,
    closeQuestion,
} from "../utils/gameLogic.js";

const sampleQuestions = [
    {
        id: "q1",
        category: "History",
        value: 100,
        text: "Who was the first president?",
        options: ["George Washington", "John Adams", "Thomas Jefferson", "Abe Lincoln"],
        answer: "George Washington",
        used: false,
    },
    {
        id: "q2",
        category: "Science",
        value: 200,
        text: "What planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Venus", "Jupiter"],
        answer: "Mars",
        used: false,
    },
];

describe("gameLogic", () => {
    it("creates a 6-character room code", () => {
        const rooms = {};
        const code = createRoomCode(rooms);

        expect(code).toHaveLength(6);
        expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it("does not create a duplicate room code", () => {
        const rooms = {
            ABC123: {},
        };

        const code = createRoomCode(rooms);

        expect(code).not.toBe("ABC123");
        expect(code).toHaveLength(6);
    });

    it("creates a room with cloned questions and the correct host", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");

        expect(room.roomCode).toBe("ROOM01");
        expect(room.hostId).toBe("host-1");
        expect(room.players).toEqual([]);
        expect(room.currentQuestion).toBe(null);

        expect(room.questions).not.toBe(sampleQuestions);
        expect(room.questions).toEqual(sampleQuestions);
    });

    it("checks if a socket is the room host", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");

        expect(isRoomHost(room, "host-1")).toBe(true);
        expect(isRoomHost(room, "player-1")).toBe(false);
    });

    it("finds a room even if the code has lowercase letters or spaces", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");
        const rooms = {
            ROOM01: room,
        };

        expect(findRoom(rooms, " room01 ")).toBe(room);
    });

    it("adds a player to a room", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");
        const player = new Player("player-1", "Brandon");

        addPlayerToRoom(room, player);

        expect(room.players).toHaveLength(1);
        expect(room.players[0].name).toBe("Brandon");
        expect(room.players[0].score).toBe(0);
    });

    it("does not add the same player twice", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");
        const player = new Player("player-1", "Brandon");

        addPlayerToRoom(room, player);
        addPlayerToRoom(room, player);

        expect(room.players).toHaveLength(1);
    });

    it("selects a question and marks it as used", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");
        const player = new Player("player-1", "Brandon");
        player.selectedAnswer = "Old answer";
        room.players.push(player);

        const rooms = {
            ROOM01: room,
        };

        const updatedRoom = selectQuestion(rooms, "ROOM01", "q1");

        expect(updatedRoom.currentQuestion.id).toBe("q1");
        expect(updatedRoom.currentQuestion.used).toBe(true);
        expect(updatedRoom.currentCorrectPlayerId).toBe(null);
        expect(updatedRoom.hasQuestionBeenAnswered).toBe(false);
        expect(updatedRoom.players[0].selectedAnswer).toBe(null);
    });

    it("does not reselect a used question", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");
        const rooms = {
            ROOM01: room,
        };

        selectQuestion(rooms, "ROOM01", "q1");
        const firstQuestion = room.currentQuestion;

        const result = selectQuestion(rooms, "ROOM01", "q1");

        expect(result.currentQuestion).toBe(firstQuestion);
    });

    it("gives points to the first player with the correct answer", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");
        room.players.push(new Player("player-1", "Brandon"));

        const rooms = {
            ROOM01: room,
        };

        selectQuestion(rooms, "ROOM01", "q1");
        submitAnswer(rooms, "ROOM01", "player-1", "George Washington");

        expect(room.players[0].score).toBe(100);
        expect(room.players[0].selectedAnswer).toBe("George Washington");
        expect(room.currentCorrectPlayerId).toBe("player-1");
        expect(room.hasQuestionBeenAnswered).toBe(true);
    });

    it("does not give points for a wrong answer", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");
        room.players.push(new Player("player-1", "Brandon"));

        const rooms = {
            ROOM01: room,
        };

        selectQuestion(rooms, "ROOM01", "q1");
        submitAnswer(rooms, "ROOM01", "player-1", "John Adams");

        expect(room.players[0].score).toBe(0);
        expect(room.players[0].selectedAnswer).toBe("John Adams");
        expect(room.currentCorrectPlayerId).toBe(null);
        expect(room.hasQuestionBeenAnswered).toBe(false);
    });

    it("ignores answers after the question has already been answered correctly", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");
        room.players.push(new Player("player-1", "Brandon"));
        room.players.push(new Player("player-2", "Alex"));

        const rooms = {
            ROOM01: room,
        };

        selectQuestion(rooms, "ROOM01", "q1");
        submitAnswer(rooms, "ROOM01", "player-1", "George Washington");
        submitAnswer(rooms, "ROOM01", "player-2", "George Washington");

        expect(room.players[0].score).toBe(100);
        expect(room.players[1].score).toBe(0);
        expect(room.currentCorrectPlayerId).toBe("player-1");
    });

    it("closes a question and resets answer state", () => {
        const room = createRoom("ROOM01", sampleQuestions, "host-1");
        const player = new Player("player-1", "Brandon");
        room.players.push(player);

        const rooms = {
            ROOM01: room,
        };

        selectQuestion(rooms, "ROOM01", "q1");
        submitAnswer(rooms, "ROOM01", "player-1", "George Washington");

        closeQuestion(rooms, "ROOM01");

        expect(room.currentQuestion).toBe(null);
        expect(room.currentCorrectPlayerId).toBe(null);
        expect(room.hasQuestionBeenAnswered).toBe(false);
        expect(room.players[0].selectedAnswer).toBe(null);
    });
});