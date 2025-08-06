import { Resend } from "resend";
const runtimeConfig = useRuntimeConfig();
const resend = new Resend(runtimeConfig.resendApiKey);

export async function email(email, subject, body) {
	console.log("sending email");
	try {
		const data = await resend.emails.send({
			from: "Digital Ledgers <noreply@digitaledgers.com>",
			to: email,
			subject: subject,
			html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static Template</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
    <script>
      function updateDates() {
        const now = new Date();
        const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
        const formattedDate = now.toLocaleDateString('en-US', options);
        
        document.getElementById('currentDate').textContent = formattedDate;
        document.getElementById('copyrightYear').textContent = now.getUTCFullYear();
      }
      window.onload = updateDates;
    </script>
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #ffffff;
      font-size: 14px;
    "
  >
    <div
      style="
        max-width: 680px;
        margin: 0 auto;
        padding: 45px 30px 60px;
        background: #f4f7ff;
        background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
        background-repeat: no-repeat;
        background-size: 800px 452px;
        background-position: top center;
        font-size: 14px;
        color: #434343;
      "
    >
      <header>
        <table style="width: 100%;">
          <tbody>
            <tr style="height: 0;">
              <td>
                <img
                  alt=""
                  src="https://eyhkkuzspchiyqrqjyjk.supabase.co/storage/v1/object/public/general-public/logo.png?t=2024-09-16T07%3A16%3A29.392Z"
                  height="30px"
                />
              </td>
              <td style="text-align: right;">
                <span
                  id="currentDate"
                  style="font-size: 16px; line-height: 30px; color: #ffffff;"
                ></span>
              </td>
            </tr>
          </tbody>
        </table>
      </header>

      <main>
        <div
          style="
            margin: 0;
            margin-top: 70px;
            padding: 92px 30px 115px;
            background: #ffffff;
            border-radius: 30px;
            text-align: center;
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto;">
            <h1
              style="
                margin: 0;
                font-size: 24px;
                font-weight: 500;
                color: #1f1f1f;
              "
            >
              ${subject}
            </h1>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-weight: 500;
                letter-spacing: 0.56px;
              "
            >
              ${body}
            </p>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            margin-top: 90px;
            text-align: center;
            font-weight: 500;
            color: #8c8c8c;
          "
        >
          Need help? Ask at
          <a
            href="mailto:archisketch@gmail.com"
            style="color: #499fb6; text-decoration: none;"
            >support@digitaledgers.com</a
          >
          or visit our
          <a
            href=""
            target="_blank"
            style="color: #499fb6; text-decoration: none;"
            >Help Center</a
          >
        </p>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 20px auto 0;
          text-align: center;
          border-top: 1px solid #e6ebf1;
        "
      >
        <p
          style="
            margin: 0;
            margin-top: 40px;
            font-size: 16px;
            font-weight: 600;
            color: #434343;
          "
        >
          Digital ledgers
        </p>
        <p style="margin: 0; margin-top: 8px; color: #434343;">
          Calle Alcala 75, 4*DCH 28009 Madrid Spain
        </p>
      </footer>
    </div>
  </body>
</html>`,
		});
		return data;
	} catch (error) {
		return { error };
	}
}
