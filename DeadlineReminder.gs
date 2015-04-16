// Instantiate and run constructor
function runDeadlineReminder() {
  // Change this template to change text in automated email
  var reminderEmail = "Hi { firstName },\n\nPlease remember to complete  { bookName } by { NewCycle }.\n\nHappy reading!",
      subject = '[BOOKCLUB] Reminder For Upcoming Cycle';

  new DeadlineReminder(reminderEmail, subject).run();
}

// Constructor for assigning book
function DeadlineReminder(reminderEmail, subject) {
  var scheduleSheet = SpreadsheetApp.getActiveSpreadsheet()
                                     .getSheetByName("Schedule");
  this.scheduleSheetData = scheduleSheet.getDataRange().getValues();
  this.scheduleSheetIndex = this.indexSheet(this.scheduleSheet);

  var addressesSheet = SpreadsheetApp.getActiveSpreadsheet()
                                      .getSheetByName("Addresses");
  this.addressesSheetData = addressesSheet.getDataRange().getValues();
  this.addressesSheetIndex = this.indexSheet(this.addressesSheetData);

  this.reminderEmail = reminderEmail;
  this.subject = subject;

  this.numberToLetters = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'G',
    7: 'H',
    8: 'I',
    9: 'J',
    10: 'K',
    11: 'L',
    12: 'M',
  };
}

AssignBook.prototype.indexSheet = function(sheetData) {
  var result = {},
      length = sheetData[0].length;

  for (var i = 0; i < length; i++) {
    resultsheetData[0][i] = i;
  }

  return result;
};

// Main script for running function
AssignBook.prototype.run = function() {
  // Get today's date
  var today = new Date(),
      newCycle = this.findNextCycle().
      newCycleDate = newCycle[1],
      newCycleRowIdx = this.findNextCycle()[0];

  // Go through every column in Schedule tab, send email if the person has not finished book yet -- add note when successfully sent email
  for (var i = 1; i < this.scheduleSheetData.length; i++) {
    if (this.scheduleSheetData[i][newCycleRowIdx] === "") {
      var emailIdx = this.addressesSheetIndex.Email,
          contactEmail = this.addressesSheetData[i][emailIdx],
          sheetName = 'Schedule',
          cellCode = this.numberToLetters[i] + newCycleRowIdx,
          nameIdx = this.scheduleSheetData.Name,
          options = {note: "Reminder sent: " + today,
                     NewCycle: newCycleDate,
                     bookName: this.scheduleSheetData[i][newCycleRowIdx - 1],
                     firstName: this.addressesSheetData[i][nameIdx]};

      new Email(contactEmail, this.subject, this.reminderEmail, sheetName, cellCode, options);
    }
  }
};

// Find first row that is not before today's date -- remember date
AssignBook.prototype.findNextCycle = function() {
  var newCycleColumnIdx = this.scheduleSheetIndex.NewCycle;

  for (i = 1; i < length; i++) {
    var newCycle = this.scheduleSheetData[i][newCycleColumnIdx];

    if (newCycle > today) {
      return [i, newCycle];
    }
  }
};
