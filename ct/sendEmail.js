var contextValues = {};
var fetchPayload = {
};
var urls = {
};

function login() {
  var postOptions = {
    method: 'post',
    payload: {
      'email': fetchPayload.email,
      'password': sjcl.decrypt(fetchPayload.salt, fetchPayload.password),
    },
    followRedirects: true,
  };
  var loginPage = UrlFetchApp.fetch(urls.login , postOptions);
  fetchPayload.cookie = loginPage.getAllHeaders()['Set-Cookie'];
  return loginPage.getContentText();
}

function getMainPage() {
  if (!fetchPayload.cookie) {
    return login();
  } else {
    var mainPage = UrlFetchApp.fetch(urls.main,
                                    {
                                      headers : {
                                        Cookie: fetchPayload.cookie,
                                      },
                                    });
    return mainPage.getContentText();
  }
}

// Main function for each sheet
function updateSheet() {
  contextValues.sheet = SpreadsheetApp.getActiveSpreadsheet()
                                      .getSheetByName('Current');
  contextValues.sheetData = contextValues.sheet.getDataRange().getValues();
  contextValues.sheetIndex = indexSheet(contextValues.sheetData);
  processPreviousListings();
  var mainPage = getMainPage();
  archiveExpiredItems();
}

// Figure out last 30 listings so there are no repeats
function processPreviousListings() {
  contextValues.lastRow = numberOfRows(contextValues.sheetData);
  var idIdx = contextValues.sheetIndex.Url;
  var titleIdx = contextValues.sheetIndex.Title;
  var feeIdx = contextValues.sheetIndex['Admin Fee'];
  contextValues.previousListings = {};
  for (var i = 1; i < contextValues.lastRow; i++) {
    contextValues.previousListings[contextValues.sheetData[i][idIdx]] = {
      row: i,
      id: contextValues.sheetData[i][idIdx],
      title: contextValues.sheetData[i][titleIdx],
      fee: contextValues.sheetData[i][feeIdx],
    };
  }
}
// Send email with new listing information
function sendEmail(listingInfo) {
  var footer = '<hr>' +
  var imageDiv = listingInfo.ImageUrl ? '<img src="' + listingInfo.ImageUrl + '" alt="' + listingInfo.Title + '" width="128">' :
                                          '';
  var emailTemplate = listingInfo.Description + '<br>' +
                        listingInfo.Location + '<br>' +
                        listingInfo.Date + '<br>' +
                        listingInfo.Category + '<br>' +
                        '<br>' +
                        imageDiv +
                        '<br><hr><br>' +
                        'Url: <a href="' + listingInfo.Url + '" target="_blank">' + listingInfo.Url + '</a>' +
                        '<hr>' +
                        footer;
  var subject = '[CT] ' + listingInfo.Title + ' (' + listingInfo.Location + ')';


  // Get information from TotalSavings tab
  var email = MailApp.sendEmail({
    to: myEmail,
    subject: subject,
    htmlBody: emailTemplate,
  });
}

// Move expired items to "Archive" sheet
function archiveExpiredItems() {
  // Now archive events that passed
  var cutRange, newRange, currentItem, row;
  var archive = SpreadsheetApp.getActiveSpreadsheet()
                                        .getSheetByName('Archive');
  var archiveData = archive.getDataRange().getValues();
  var archiveIndex = indexSheet(archiveData);
  var lastArchiveRow = numberOfRows(archiveData);
  for (var expiredItem in contextValues.previousListings) {
    if (contextValues.previousListings.hasOwnProperty(expiredItem)) {
      lastArchiveRow++;
      currentItem = contextValues.previousListings[expiredItem];
      row = currentItem.row + 1;
      cutRange = contextValues.sheet.getRange('A' + row + 'I' + row);
      newRange = archive.getRange('A' + lastArchiveRow + 'I' + lastArchiveRow)
      newRange.setValues(cutRange.getValues());
      cutRange.deleteCells(SpreadsheetApp.Dimension.ROWS);
    }
  }
}
