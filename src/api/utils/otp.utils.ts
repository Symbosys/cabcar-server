import crypto from "crypto"; 


export const generateOtp = (): string => {
  const otp = crypto.randomInt(1000, 10000).toString();
  return otp;
};


const MSGCLUB_BASE_URL = process.env.MSGCLUB_BASE_URL;
const MSGCLUB_AUTH_KEY = process.env.MSGCLUB_AUTH_KEY;
const MSGCLUB_SENDER_ID = process.env.MSGCLUB_SENDER_ID;
const MSGCLUB_ROUTE_ID = process.env.MSGCLUB_ROUTE_ID;

export const sendOtp = async (mobile: string, otp: string): Promise<void> => {
  try {
    const message = `Dear Customer, ${otp} is your one time password (OTP) to login to Cab Car (https://cabcar.in/). Don't share OTP with anyone. Regards- DEEPAK KUMAR`;

    const url = `${MSGCLUB_BASE_URL}?AUTH_KEY=${MSGCLUB_AUTH_KEY}&message=${encodeURIComponent(message)}&senderId=${MSGCLUB_SENDER_ID}&routeId=${MSGCLUB_ROUTE_ID}&mobileNos=${mobile}&smsContentType=english`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SMS API Error: ${response.statusText}`);
    }

    const result = await response.text();
    console.log("SMS sent successfully:", result);
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};
