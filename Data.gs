var ss = SpreadsheetApp.getActive()
var dataSheet = ss.getSheetByName('Data')
var fData = ss.getSheetByName('Filter Data')
var projectSheet = ss.getSheetByName('Project Entry')
var setting = ss.getSheetByName('Setting')

function onOpen(){
  SpreadsheetApp.getUi().createMenu("Automation").addItem("Create Trigger",createTrigger)
}

function createTrigger(){
  deleteTrigger()
  var s = ScriptApp.newTrigger("refreshData").timeBased().everyMinutes(10).create()
 var ss = ScriptApp.newTrigger("reminder").timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
    }



function deleteTrigger(){
var triggers = ScriptApp.getProjectTriggers();
for (var i = 0; i < triggers.length; i++){
ScriptApp.deleteTrigger(triggers[i]);
}}

function refreshData(){
var completeData = []
var sheetLinks = projectSheet.getRange("A2:H").getDisplayValues().filter(d=>d[0] !="")
Logger.log(sheetLinks)
if(sheetLinks.length >0){
fData.getRange("A2:J").clearContent()
for(let i = 0;i < sheetLinks.length;i++){
var data = SpreadsheetApp.openByUrl(sheetLinks[i][7]).getRange("A3:I46").getValues()
data.forEach(d=>{
  d.unshift(sheetLinks[i][0])
})
completeData = completeData.concat(data);
}
fData.getRange(2,1,completeData.length,10).setValues(completeData)
}}


function reminder(){

   var api = setting.getRange("B3").getValue()
  var project_Name = projectSheet.getRange("A2:A").getValues().filter(d=>d[0] !="").flat() 
  var sheetLinks = projectSheet.getRange("H2:H").getValues().filter(d=>d[0] !="").flat()

    // console.log(project_Name)
    // console.log(sheetLinks)

if(sheetLinks.length >0){

for(let i = 0;i < sheetLinks.length;i++){

var data = SpreadsheetApp.openByUrl(sheetLinks[i]).getRange("B3:I46").getDisplayValues().filter( f=>f[3]!="" && f[6] == "")

  let currentMonth = new Date().getMonth()+1
  let year = new Date().getFullYear()

if(currentMonth < 10) {
    currentMonth = '0' + currentMonth;
} else{
    currentMonth = '' + currentMonth;
}
 
  let date2 = new Date().getDate()

if(date2 < 10) {
   date2 =  '0'+ (+date2+2);
}else{
    date2 = +date2+2;
}

console.log(`${date2}-${currentMonth}-${year}`)
 
 var staffData = dataSheet.getRange("A2:C").getDisplayValues().filter(f=>f[1]!="" || f[2] !="")

data.forEach(d=>{
var sender = staffData.filter(f=>f[0] == d[2])[0]
if( d[3] <= `${date2}-${currentMonth}-${year}`)
{
  var msgTemps = dataSheet.getRange('G1:I7').getValues().filter(f=>f[0] == d[7])[0]
  console.log(d)
  var sub = msgTemps[2].replace('<<Status>>',d[7]).replace('<<ProjectName>>',project_Name[i])
  var msg = msgTemps[1].replace('<<Doer>>',d[2]).replace('<<ProjectName>>',project_Name[i]).replace('<<Subtasks>>',d[0]).replace('<<Planned Start Date>>',d[3]).replace('<<Planned Finish Date>>',d[4]).replace('<<Task Status>>',d[7]).replace("<<ActualStart>>",d[5] || "").replace("<<ActualEnd>>",d[6] || "")
  
  console.log(sub)
  console.log(msg)
  console.log(sender)
if(sender[1]!="")GmailApp.sendEmail(sender[1],sub,msg)
if(sender[2]!="")WhatsAppLibrary.sendMessage(sender[2],msg,"",[api])
}

})
}}}


function managers(){
var managersData = dataSheet.getRange('A2:B').getValues().filter(f=>f[0] != "")
console.log(managersData)
var projectType = dataSheet.getRange('D2').getValue()
var serviceType = dataSheet.getRange('E2').getValue()
return [managersData,projectType,serviceType]
}

function taskDeleted([task,link]){
var ss = SpreadsheetApp.openByUrl(link)
var activeSheet = ss.getSheetByName("Project Sheet")
console.log(task)
var allTasks = activeSheet.getRange('B1:B').getValues().flat()
console.log(allTasks)
Logger.log(allTasks.indexOf(task))
activeSheet.deleteRow(allTasks.indexOf(task)+1)
}


function taskSaved([task,link,manager,ps,pf,as,ae]){
  var api = setting.getRange("B3").getValue()
  var ss = SpreadsheetApp.openByUrl(link)
  var activeSheet = ss.getSheetByName("Project Sheet")
// console.log(task)
  var allTasks = activeSheet.getRange('B1:B').getValues().flat()
// console.log(allTasks)
  const row = allTasks.indexOf(task);

Logger.log(row)
if(ps != ""){
activeSheet.getRange(row+1,5,1,1).setValue(ps)
}
if(pf != ""){
activeSheet.getRange(row+1,6,1,1).setValue(pf)
}
if(as != ""){
activeSheet.getRange(row+1,7,1,1).setValue(as)
}
if(ae != ""){
activeSheet.getRange(row+1,8,1,1).setValue(ae)
}

SpreadsheetApp.flush()
var  status = activeSheet.getRange('D1:I').getValues()
 var msgTemps = dataSheet.getRange('G1:I7').getValues()
  var staffData = dataSheet.getRange("A2:C").getDisplayValues().filter(f=>f[1]!="" || f[2] !="")

for(var i=row;i<status.length;i++){
var projectName = ss.getName()
  if(status[i][1] == ''){
    const mng = status[i][0]

var msgs = msgTemps.filter(f=>f[0] == "Upcoming Phase")[0]
var doerE = staffData.filter(f=>f[0] == mng)[0]

var msg = msgs[1].replace('<<Doer>>', mng).replace('<<ProjectName>>',projectName).replace('<<Subtasks>>', allTasks[i]).replace('<<Planned Start Date>>', status[i][1]).replace('<<Planned Finish Date>>', status[i][2]).replace('<<Task Status>>', status[i][5]).replace("<<ActualStart>>", status[i][3]).replace("<<ActualEnd>>", status[i][4])
    console.log(msgs)
var sub = msgs[2].replace('<<Status>>', status[i][5]).replace('<<ProjectName>>',projectName)
    // console.log(sub)
if(doerE[1] !=""){GmailApp.sendEmail(doerE[1],sub,msg);console.log('forth person email')}
if(doerE[2] !=""){WhatsAppLibrary.sendMessage(doerE[2],msg,"",[api]);console.log('forth person WhatsApp')}
    break
  }
  else{
 const mng = status[i][0]
var doerE = staffData.filter(f=>f[0] == mng)[0]
var msgs = msgTemps.filter(f=>f[0] == status[i][5])[0]
var msg = msgs[1].replace('<<Doer>>', mng).replace('<<ProjectName>>',projectName).replace('<<Subtasks>>', allTasks[i]).replace('<<Planned Start Date>>', status[i][1]).replace('<<Planned Finish Date>>', status[i][2]).replace('<<Task Status>>', status[i][5]).replace("<<ActualStart>>", status[i][3]).replace("<<ActualEnd>>", status[i][4])
    console.log(msgs)
var sub = msgs[2].replace('<<Status>>', status[i][5]).replace('<<ProjectName>>',projectName)
    // console.log(sub)
if(doerE[1] !=""){GmailApp.sendEmail(doerE[1],sub,msg);}
if(doerE[2] !=""){WhatsAppLibrary.sendMessage(doerE[2],msg,"",[api]);}
  }
}
}


function updateTaskSaved([task,link,doerd,ps,pf,as,ae]){
  // console.log([task,link,doerd,ps,pf,as,ae])
  var api = setting.getRange("B3").getValue()
  var ss = SpreadsheetApp.openByUrl(link)
  var managers = dataSheet.getRange("E9:H").getValues().filter(f=>f[0] == doerd)[0]
    // console.log(managers)

  var activeSheet = ss.getSheetByName("Project Sheet")
  // console.log(task)
  var allTasks = activeSheet.getRange('B1:B').getValues().flat()
  // console.log(allTasks)
  Logger.log(allTasks.indexOf(task))
  var projectName = ss.getName()
  // console.log(projectName)
  var msgTemps = dataSheet.getRange('G1:I7').getValues()
  var staffData = dataSheet.getRange("A2:C").getDisplayValues().filter(f=>f[1]!="" || f[2] !="")

if(ps!="" && as != "" && ae == ""){
activeSheet.getRange(allTasks.indexOf(task)+1,7,1,1).setValue(as)
SpreadsheetApp.flush()
var taskUpdate = activeSheet.getRange(allTasks.indexOf(task)+1,2,1,9).getValues()[0]
  // console.log(taskUpdate)
var doer = staffData.filter(f=>f[0] == doerd)[0]
  // console.log(doer)
var msgs = msgTemps.filter(f=>f[0] == taskUpdate[7])[0]
  // console.log(msgs)
var sub = msgs[2].replace('<<Status>>',taskUpdate[7]).replace('<<ProjectName>>',projectName)
  // console.log(sub)

var msg = msgs[1].replace('<<Doer>>',doerd).replace('<<ProjectName>>',projectName).replace('<<Subtasks>>',task).replace('<<Planned Start Date>>',ps).replace('<<Planned Finish Date>>',pf).replace('<<Task Status>>',taskUpdate[7]).replace("<<ActualStart>>",taskUpdate[5]).replace("<<ActualEnd>>",taskUpdate[6])
if(doer[2] !="")WhatsAppLibrary.sendMessage(doer[2],msg,"",[api])
if(managers[2]!="")WhatsAppLibrary.sendMessage(managers[2],msg,'',[api])
if(doer[1]!="")GmailApp.sendEmail(doer[1],sub,msg)
if(managers[3]!="")GmailApp.sendEmail(managers[3],sub,msg)
}

if(as !="" && ae != ""){
activeSheet.getRange(allTasks.indexOf(task)+1,8,1,1).setValue(ae)
SpreadsheetApp.flush()
var taskUpdate = activeSheet.getRange(allTasks.indexOf(task)+1,2,1,9).getValues()[0]
var doer = staffData.filter(f=>f[0] == doerd)[0]
var msgs = msgTemps.filter(f=>f[0] == taskUpdate[7])[0]
var sub = msgs[2].replace('<<Status>>',taskUpdate[7]).replace('<<ProjectName>>',projectName)
var msg = msgs[1].replace('<<Doer>>',doerd).replace('<<ProjectName>>',projectName).replace('<<Subtasks>>',task).replace('<<Planned Start Date>>',ps).replace('<<Planned Finish Date>>',pf).replace('<<Task Status>>',taskUpdate[7]).replace("<<ActualStart>>",taskUpdate[5]).replace("<<ActualEnd>>",taskUpdate[6])
if(doer[2] !="")WhatsAppLibrary.sendMessage(doer[2],msg,"",[api])
if(managers[2]!="")WhatsAppLibrary.sendMessage(managers[2],msg,'',[api])
if(doer[1]!="")GmailApp.sendEmail(doer[1],sub,msg)
if(managers[3]!="")GmailApp.sendEmail(managers[3],sub,msg)
}
}
