/**
 * Opens a modal dialog with the React app.
 */
function showLetterGenerator() {
    var htmlOutput = HtmlService.createHtmlOutputFromFile('index')
        .setWidth(1000)
        .setHeight(700);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Generate a Letter');
  }
  
  /**
   * Generates a letter using form data submitted from the React frontend.
   * @param {Object} formData - Contains gregorianDate, title, receiver, cc, and language.
   * @returns {string} URL of the generated letter.
   */
  function createLetterFromForm(formData) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var configSheet = ss.getSheetByName("Sys_Config");
      if (!configSheet) {
        throw new Error('Sheet named "Sys_Config" not found.');
      }
      
      // Load configuration from Sys_Config.
      var CONFIG = loadConfig(configSheet);
      
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
      if (!templateId) {
        throw new Error('Template ID not configured for language: ' + formData.language);
      }
      
      // Convert the Gregorian date to a formatted string.
      var rawDate = formData.gregorianDate;
      var dateObj = new Date(rawDate);
      var formattedDate = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'dd/MM/yyyy');
      
      // Convert to Ethiopian date (assumes a conversion function exists).
      var ethiopianDate = gregorianToEthiopian(formData.gregorianDate) || '';
      
      // Create the letter document in the specified folder.
      var folder = DriveApp.getFolderById(CONFIG.folderId);
      var newDoc = DriveApp.getFileById(templateId).makeCopy('Letter_' + formattedReferenceNumber, folder);
      var newDocId = newDoc.getId();
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
      
      // Return the URL of the generated letter.
      return newDoc.getUrl();
    } catch (err) {
      throw new Error('Error in createLetterFromForm: ' + err.message);
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
  
    /**
   * doGet serves the bundled React app.
   */
    function doGet() {
      const template = HtmlService.createTemplateFromFile('index');
      return template.evaluate()
        .setTitle('React App with Google Sheets')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  
  /**
   * onOpen adds a custom menu to open the letter generation UI.
   */
  function onOpen() {
    SpreadsheetApp.getUi().createMenu('Letters Menu')
      .addItem('Generate Letter (UI)', 'showLetterGenerator')
      .addToUi();
  }