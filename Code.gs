var docId = "YOUR-DOC-ID"; // Replace with your Google Doc ID
var pdfFolderId = "YOUR-FOLDER-ID"; // Replace with your PDF folder ID
var shortIoApiToken = "YOUR-PRIVATE-KEY"; // Replace with your Short.io API key
var shortIoDomain = "YOUR-SHORTIO-DOMAIN"; // Replace with your Short.io domain (from the response). Ex: fywl.short.gy

// These are the desired custom aliases for each type of link
var shortIoAliasPreview = "CUSTOM-ALIAS-preview"; // Replace with your desired custom alias for preview / embed
var shortIoAliasDownload = "CUSTOM-ALIAS-download"; // Replace with your desired custom alias for download

function onOpen() {
  var ui = DocumentApp.getUi();
  ui.createMenu('Custom PDF Menu')
    .addItem('Update PDF', 'updatePDF')
    .addToUi();
}

function updatePDF() {
  var doc = DocumentApp.openById(docId);
  var pdfFolder = DriveApp.getFolderById(pdfFolderId);
  var docName = doc.getName();
  var pdfName = docName + ".pdf";

  // Delete existing PDF if it exists
  var existingPdfs = pdfFolder.getFilesByName(pdfName);
  while (existingPdfs.hasNext()) {
    existingPdfs.next().setTrashed(true);
  }

  // Create new PDF
  var pdfContentBlob = doc.getAs('application/pdf');
  var newPdf = pdfFolder.createFile(pdfContentBlob);
  newPdf.setName(pdfName);

  // Set sharing permissions to "Anyone with the link can view"
  newPdf.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Store the new PDF's ID in ScriptProperties
  PropertiesService.getScriptProperties().setProperty('currentPdfId', newPdf.getId());

  // Get the preview and download URLs for the PDF
  var pdfPreviewUrl = getPreviewUrl(newPdf.getId());
  var pdfDownloadUrl = getDownloadUrl(newPdf.getId()); 

  // Update or create Short.io URLs with new PDF URLs (both preview and download)
  updateShortIoUrl(pdfPreviewUrl, shortIoAliasPreview);
  updateShortIoUrl(pdfDownloadUrl, shortIoAliasDownload);

  Logger.log("New PDF created and Short.io URLs updated: " + getShortIoUrl(shortIoAliasPreview));
  Logger.log("New PDF created and Short.io URLs updated: " + getShortIoUrl(shortIoAliasDownload));
  return getShortIoUrl(shortIoAliasPreview), getShortIoUrl(shortIoAliasDownload);
}

function getPreviewUrl(fileId) {
  return "https://drive.google.com/file/d/" + fileId + "/preview";
}

function getDownloadUrl(fileId) {
  return "https://drive.google.com/uc?export=download&id=" + fileId;
}

function updateShortIoUrl(longUrl, alias) {
  var existingLinkId = getExistingShortIoLinkId(shortIoDomain, alias);

  if (existingLinkId) {
    Logger.log("Existing short link found for " + alias + ". Updating the link.");

    var updateData = {
      "originalURL": longUrl,
      "domain": shortIoDomain,
      "path": alias
    };

    var updateUrl = `https://api.short.io/links/${existingLinkId}`;

    var updateOptions = {
      "method": "post", // Correct method for updating
      "headers": {
        "Content-Type": "application/json",
        "Authorization": shortIoApiToken
      },
      "payload": JSON.stringify(updateData),
      "muteHttpExceptions": true
    };

    var responseUpdate = UrlFetchApp.fetch(updateUrl, updateOptions);
    var resultUpdate = JSON.parse(responseUpdate.getContentText());

    if (responseUpdate.getResponseCode() === 401) {
      Logger.log("Authorization issue: " + responseUpdate.getContentText());
      return;
    }

    if (responseUpdate.getResponseCode() === 200) {
      PropertiesService.getScriptProperties().setProperty('shortIoUrl_' + alias, resultUpdate.secureShortURL);
      Logger.log("Short.io URL updated successfully: " + resultUpdate.secureShortURL);
    } else {
      Logger.log("Error updating Short.io URL: " + responseUpdate.getContentText());
    }
  } else {
    // Otherwise, create a new short link
    var createUrl = "https://api.short.io/links";
    var createData = {
      "originalURL": longUrl,
      "domain": shortIoDomain,
      "path": alias
    };

    var createOptions = {
      "method": "post",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": shortIoApiToken
      },
      "payload": JSON.stringify(createData),
      "muteHttpExceptions": true
    };

    var responseCreate = UrlFetchApp.fetch(createUrl, createOptions);
    var resultCreate = JSON.parse(responseCreate.getContentText());

    if (responseCreate.getResponseCode() === 401) {
      Logger.log("Authorization issue: " + responseCreate.getContentText());
      return;
    }
    if (responseCreate.getResponseCode() !== 200) {
      Logger.log("Error creating Short.io URL: " + responseCreate.getContentText());
    } else {
      PropertiesService.getScriptProperties().setProperty('shortIoUrl_' + alias, resultCreate.secureShortURL);
      Logger.log("Short.io URL created successfully: " + resultCreate.secureShortURL);
    }
  }
}

function getExistingShortIoLinkId(domain, path) {
  var url = `https://api.short.io/links/expand?domain=${encodeURIComponent(domain)}&path=${encodeURIComponent(path)}`;
  
  var options = {
    "method": "get",
    "headers": {
      "Authorization": shortIoApiToken
    },
    "muteHttpExceptions": true
  };

  try {
    Logger.log(`Fetching existing link ID with URL: ${url} and options: ${JSON.stringify(options)}`);
    var response = UrlFetchApp.fetch(url, options);
    var result = JSON.parse(response.getContentText());

    Logger.log(`Response status code: ${response.getResponseCode()}`);
    Logger.log(`Response content: ${response.getContentText()}`);

    if (response.getResponseCode() === 200 && result && result.idString) {
      Logger.log(`Found existing Short.io link with ID: ${result.idString}`);
      return result.idString;
    } else {
      Logger.log(`No existing Short.io link found for the domain: ${domain} and path: ${path}`);
      return null;
    }
  } catch (error) {
    Logger.log(`Error fetching existing Short.io link: ${error.message}`);
    return null;
  }
}

function getShortIoUrl(alias) {
  return PropertiesService.getScriptProperties().getProperty('shortIoUrl_' + alias) || "Short.io URL not set";
}

function doGet(e) {
  var previewUrl = getShortIoUrl(shortIoAliasPreview);
  var downloadUrl = getShortIoUrl(shortIoAliasDownload);
  if (previewUrl === "Short.io URL not set" && downloadUrl === "Short.io URL not set") {
    return ContentService.createTextOutput("No PDF available. Please run updatePDF() first.");
  }

  return HtmlService.createHtmlOutput(
    `<p>Preview URL: <a href="${previewUrl}">${previewUrl}</a></p>
     <p>Download URL: <a href="${downloadUrl}">${downloadUrl}</a></p>`
  );
}
