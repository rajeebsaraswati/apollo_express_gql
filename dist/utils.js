import jwt from "jsonwebtoken";
// Generate a 6-digit OTP
export const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};
// Set expires_at to 10 minutes ahead of now
export const getOtpExpiryDate = () => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    return expiresAt;
};
export const isOtpExpired = (otp) => {
    return new Date(otp.expires_at).getTime() < Date.now();
};
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export const generateJwtPair = (payload, accessTokenExpiresIn = "1d", refreshTokenExpiresIn = "7d") => {
    const accessToken = jwt.sign({ user: { ...payload }, tokenType: "access" }, JWT_SECRET, { expiresIn: accessTokenExpiresIn });
    const refreshToken = jwt.sign({ user: { ...payload }, tokenType: "refresh" }, JWT_SECRET, { expiresIn: refreshTokenExpiresIn });
    return { accessToken, refreshToken };
};
export const isJwtExpired = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return false;
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            return true;
        }
        return false;
    }
};
export const decodeJwt = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
};
