// Generates Redis key for authentication sessions)
// If userId or sessionId is not provided, it defaults to '*' for pattern matching
export const generateAuthSessionKey = (userId = '*', sessionId = '*') => {
    return `session:${userId}:${sessionId}`;
}