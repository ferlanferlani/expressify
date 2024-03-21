import jwt from "jsonwebtoken";
import { sendEmail } from "../../services/nodemailer.js";
export const resendEmailVerification = async (req, res) => {
  const protocol = req.protocol;
  const hostname = req.hostname;
  const port = req.socket.localPort;

  const baseUrl = `${protocol}://${hostname}:${port}`;
  const userToken = req.cookies.user;

  if (!userToken) {
    return res.sendStatus(403);
  }

  // verify user token
  const userCredential = jwt.verify(
    userToken,
    process.env.USER_TOKEN,
    (err, decoded) => {
      if (err) return res.sendStatus(403);
      const { userId, name, email } = decoded;
      return { userId, name, email };
    }
  );

  const { userId, name, email } = userCredential;

  // send email verification
  try {
    await sendEmail(userId, name, email, baseUrl);
    res.status(200).json({
      success: true,
      message: "Email verification sent",
    });
    res.clearCookie("user");
  } catch (error) {
    console.log(error);
  }
};
