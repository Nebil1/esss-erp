// Code.gs
function createLetterFromForm(formData) {
  Logger.log("createLetterFromForm called with data: " + JSON.stringify(formData));
  
  try {
    Logger.log("Starting letter generation process");
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log("Got active spreadsheet: " + ss.getName());
    var configSheet = ss.getSheetByName("Sys_Config");
    if (!configSheet) {
      Logger.log("Error: Sheet named 'Sys_Config' not found");
      throw new Error('Sheet named "Sys_Config" not found.');
    }
    
    // Load configuration from Sys_Config.
    Logger.log("Loading configuration from Sys_Config");
    var CONFIG = loadConfig(configSheet);
    Logger.log("Config loaded: " + JSON.stringify(CONFIG));
    
    // Use the active sheet (or you can choose a specific log sheet) to get the reference cell.
    var activeSheet = ss.getActiveSheet();
    var referenceCell = activeSheet.getRange(CONFIG.referenceCell);
    var referenceNumber = referenceCell.getValue();
    if (isNaN(referenceNumber) || referenceNumber === '') {
      referenceNumber = 1;
    }
    var formattedReferenceNumber = Utilities.formatString('%04d', referenceNumber);
    
    // Get the template ID for the requested language.
    var templateId = CONFIG.templateIds[formData.language];
    Logger.log("Template ID for language " + formData.language + ": " + templateId);
    if (!templateId) {
      Logger.log("Error: Template ID not configured for language: " + formData.language);
      throw new Error('Template ID not configured for language: ' + formData.language);
    }
    
    // Convert the Gregorian date to a formatted string.
    var rawDate = formData.gregorianDate;
    var dateObj = new Date(rawDate);
    var formattedDate = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    
    // Convert to Ethiopian date (assumes a conversion function exists).
    var ethiopianDate = gregorianToEthiopian(formData.gregorianDate) || '';
    
    // Create the letter document in the specified folder.
    Logger.log("Creating letter document in folder: " + CONFIG.folderId);
    var folder = DriveApp.getFolderById(CONFIG.folderId);
    var newDoc = DriveApp.getFileById(templateId).makeCopy('Letter_' + formattedReferenceNumber, folder);
    var newDocId = newDoc.getId();
    Logger.log("Created new document with ID: " + newDocId);
    var doc = DocumentApp.openById(newDocId);
    var body = doc.getBody();
    
    // Replace placeholders in the document.
    body.replaceText('<<Reference Number>>', formattedReferenceNumber);
    body.replaceText('<<ቀን>>', ethiopianDate);
    body.replaceText('<<Date>>', formattedDate);
    body.replaceText('<<Re>>', formData.title || '');
    body.replaceText('<<To>>', formData.receiver || '');
    body.replaceText('<<CC>>', formData.cc || '');
    
    doc.saveAndClose();
    
    // Increment the reference number for future letters.
    referenceCell.setValue(Number(referenceNumber) + 1);
    
    Logger.log("Letter generation completed successfully");
    return newDoc.getUrl();
  } catch (error) {
    Logger.log("Error in createLetterFromForm: " + error.message);
    Logger.log("Stack trace: " + error.stack);
    throw error;
  }
}

 /**
   * Loads configuration values from the Sys_Config sheet.
   * Expected values (example):
   *  - Cell B2: English template ID.
   *  - Cell B3: Amharic template ID.
   *  - Cell B4: Folder ID where letters are stored.
   *  - Cell B5: Cell reference (e.g., "B5") for the current reference number.
   *
   * @param {Sheet} inputSheet - The Sys_Config sheet.
   * @returns {Object} CONFIG object.
   */
 function loadConfig(inputSheet) {
  var config = {};
  config.templateIds = {
    EN: inputSheet.getRange('B2').getValue(),
    AM: inputSheet.getRange('B3').getValue()
  };
  config.folderId = inputSheet.getRange('B4').getValue();
  // The referenceCell value (e.g., "B5") is stored as a string.
  config.referenceCell = inputSheet.getRange('B5').getValue();
  return config;
}

/**
 * Dummy Gregorian-to-Ethiopian date conversion function.
 * Replace with actual conversion logic as needed.
 * @param {string} gregDate - The Gregorian date string.
 * @returns {string} The Ethiopian date string.
 */
function gregorianToEthiopian(gregDate) {
  // This is a placeholder. Implement the conversion logic or call an external API.
  return 'Ethiopian equivalent of ' + gregDate;
}
  
  function openLetterGenerator() {
    var template = HtmlService.createTemplateFromFile('index');
    var htmlOutput = template.evaluate().setWidth(1200).setHeight(1200);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'ESSP letter generator');
  } 
  
  function onOpen() {
    var ui = SpreadsheetApp.getUi();
    // Add a new menu item called "React App"
    ui.createMenu('Letters Menu')
      .addItem('Generate Letter (UI)', 'openLetterGenerator')
      .addToUi();
  }
  
  function doGet() {
    const template = HtmlService.createTemplateFromFile('index');
    return template.evaluate()
      .setTitle('React App with Google Sheets')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
/**
 * Function to view logs - can be run from the script editor
 */
function viewLogs() {
  var logs = Logger.getLog();
  if (logs) {
    console.log(logs);
  } else {
    console.log("No logs found");
  }
}
  
  