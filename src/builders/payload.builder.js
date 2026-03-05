export const generateJWTPayload = (user, sessionId) => {
    return {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
    };
}

export const generateSessionPayload = (user, refreshTokenHash) => {
    return {
        userId: user.id,
        role: user.role,
        refreshTokenId: refreshTokenHash,
        createdAt: new Date(),
    };
}