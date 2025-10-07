
const sendResponse = (res, statusCode, message, data = {}) => {
  // กำหนดโครงสร้าง Body Response
  const responseBody = {
    // ใช้ statusCode ที่เป็นตัวเลขเดียวกับ HTTP Status Code
    status: statusCode,
    message: message,
    data: data,
  };

  // ส่ง HTTP Status Code จริง และ Body Response
  return res.status(statusCode).json(responseBody);
};

module.exports = { sendResponse };