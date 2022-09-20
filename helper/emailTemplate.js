const getVerificationEmailTemplate = (otp) => {
  return `<h1>Welcome to TheShopbook</h1><li>Your Verification OTP is <strong style='font-size:18px;color: blue;'>${otp}</strong></li>`;
};

const getSendUserDetailEmailTemplate = (data) => {
  const { name, email, phoneNo } = data;
  const password = phoneNo.substring(0, 3) + "XXXXXXX";
  const temp = [];
  temp.push(
    `<h1>Hello <strong style='color:#2f49ed;'>${name}</strong>, Welcome to TheShopbook.</h1>`
  );
  temp.push(
    `<p>Congratulations! You are registered. Use below email and password for login.</p>`
  );
  temp.push(`<div>Email : <strong>${email}</strong></div>`);
  temp.push(
    `<div>Password : <strong>${password}</strong> (Your phone number)</div>`
  );
  temp.push(`<br></br>`);
  temp.push(`<p>Please Reset Your Password after Login.</p>`);
  temp.push(`<br></br>`);
  temp.push(`<h1 style='color:#2f49ed;'>How to Login and User?</h1>`);
  temp.push(
    `<ul><li>Go to URL <a href='www.theshopbook.netlify.app'>www.theshopbook.netlify.app</a></li>`
  );
  temp.push(
    `<li>If using on Android, Use Chrome and open site click on top-right three dots and Click on <stong>Add to Home Screen</strong></li>`
  );
  temp.push(
    `<li>If using on Desktop, Use Chrome and open site and check <stong>Download Icon</strong> in right side of URL bar </li>`
  );
  temp.push(
    `<li>If using on I-Phone, Use Safari and open site click on Then tap the Share icon at the bottom. Then tap <stong>Add to Home Screen</strong>  from the menu.</li><ul>`
  );
  temp.push("<h3>Thank you</h3>");
  return temp.join("");
};

module.exports = {
  getVerificationEmailTemplate,
  getSendUserDetailEmailTemplate,
};
