import crypto from "crypto"; 
import { ErrorResponse } from "./response.util";
import { statusCode } from "../types/types";


export const generateOtp = (): string => {
  const otp = crypto.randomInt(1000, 10000).toString();
  return otp;
};


const MSGCLUB_BASE_URL = process.env.MSGCLUB_BASE_URL;
const MSGCLUB_AUTH_KEY = process.env.MSGCLUB_AUTH_KEY;
const MSGCLUB_SENDER_ID = process.env.MSGCLUB_SENDER_ID;
const MSGCLUB_ROUTE_ID = process.env.MSGCLUB_ROUTE_ID;

export const sendOtp = async (mobile: string, otp: string): Promise<void> => {
  const authKey = "34d66a7f7938ef441831817271f9f69a";
  const senderId = "dpkuma";
  const routeId = "8";
  const smsContentType = "english";

  const message = encodeURIComponent(
    `Dear Customer, ${otp} is your one time password (OTP) to login to Cab Car (https://cabcar.in/). Don't share OTP with anyone. Regards- DEEPAK KUMAR`
  );

  const url = `http://msg.msgclub.net/rest/services/sendSMS/sendGroupSms?AUTH_KEY=${authKey}&message=${message}&senderId=${senderId}&routeId=${routeId}&mobileNos=${mobile}&smsContentType=${smsContentType}`;

  try {
    const response = await fetch(url, {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.text(); // or response.json() if API returns JSON

    console.log("SMS sent successfully:", result);
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
