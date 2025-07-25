import crypto from "crypto"; 


export const generateOtp = (): string => {
  const otp = crypto.randomInt(1000, 10000).toString();
  return otp;
};


export const sendOtp = async (mobile: string, otp: string): Promise<void> => {
  try {
    const message = `Dear Customer, ${otp} is your one time password (OTP) to login to cabcar. Don't share OTP with anyone. Team Cab Car`;

    const url = `${process.env.AZMOBIA_BASE_URL}?authentic-key=${process.env.AZMOBIA_AUTH_KEY}&senderid=${process.env.AZMOBIA_SENDER_ID}&route=${process.env.AZMOBIA_ROUTE}&templateid=${process.env.AZMOBIA_TEMPLATE_ID}&message=${encodeURIComponent(message)}&number=${mobile}`;

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
