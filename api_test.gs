var shortIoApiToken = 'YOUR_API_KEY'; // Replace with your Short.io API key

function testShortIoApiKey() {
  var testUrl = "https://api.short.io/api/domains";
  
  var options = {
    method: 'get',
    headers: {
      'Authorization': shortIoApiToken,
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(testUrl, options);
    var responseCode = response.getResponseCode();
    var responseBody = response.getContentText();
    
    if (responseCode === 200) {
      Logger.log('Short.io API Key is valid.');
      Logger.log('Response: ' + responseBody);
    } else {
      Logger.log('Error: ' + responseCode);
      Logger.log('Response: ' + responseBody);
    }
  } catch (error) {
    Logger.log('Request error: ' + error.message);
  }
}

// Example usage: Run this function to test your Short.io API key.
function runTestShortIoApiKey() {
  testShortIoApiKey();
}
