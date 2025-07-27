export const bodyForEmailVerification = (url : string) : string =>{
   return  `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify your email</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Welcome to UrlKit!</h2>
      <p style="font-size: 16px; color: #555;">
        Please verify your email by clicking the button below:
      </p>
      <a href="${url}" target="_blank" style="display: inline-block; margin-top: 20px; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Verify Email
      </a>
      <p style="font-size: 12px; color: #aaa; margin-top: 30px;">
        If you didn’t create an account, you can ignore this email.
      </p>
    </div>
  </body>
</html>
`;
}