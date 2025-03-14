/**
 * Verifies if an email has access based on the access_list spreadsheet
 *
 * @param {string} email - The email address to verify
 * @return {Object} Response with access status and message
 */
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // Get the email parameter from the request
    const email = e.parameter.email;

    if (!email) {
      return output.setContent(
        JSON.stringify({
          status: "error",
          message: "Email parameter is required",
          hasAccess: false,
        })
      );
    }

    // Access the spreadsheet - replace with your spreadsheet ID
    const spreadsheetId = "1llVOslAeTzNR12hzi2xToUoEdQOMShG2DVSzjq4oRr8";
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    // Access the sheet with the access list
    const sheet = spreadsheet.getSheetByName("access_list");

    if (!sheet) {
      return output.setContent(
        JSON.stringify({
          status: "error",
          message: "Access list sheet not found",
          hasAccess: false,
        })
      );
    }

    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();

    // Find the header row to identify column indices
    const headers = data[0];
    const emailColIndex = headers.indexOf("Email");
    const accessColIndex = headers.indexOf("access");

    if (emailColIndex === -1 || accessColIndex === -1) {
      return output.setContent(
        JSON.stringify({
          status: "error",
          message: "Required columns not found in sheet",
          hasAccess: false,
        })
      );
    }

    let hasAccess = false;
    let accessLevel = "";

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const emailInSheet = row[emailColIndex];

      if (emailInSheet.toLowerCase() === email.toLowerCase()) {
        accessLevel = row[accessColIndex];
        hasAccess =
          accessLevel &&
          accessLevel.toString().toLowerCase() !== "false" &&
          accessLevel.toString() !== "0";
        break;
      }
    }

    // Return the result
    return output.setContent(
      JSON.stringify({
        status: "success",
        email: email,
        hasAccess: hasAccess,
        accessLevel: accessLevel || "none",
      })
    );
  } catch (error) {
    return output.setContent(
      JSON.stringify({
        status: "error",
        message: error.toString(),
        hasAccess: false,
      })
    );
  }
}

/**
 * Sets CORS headers for the response
 */
function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doGet(e) {
  return ContentService.createTextOutput("done");
}
