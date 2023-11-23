function doGet(e){
    const ch = e.parameter
    var page = HtmlService.createTemplateFromFile(ch.v);
    if(ch.v=='Index'){
    
    const access = mailIDS();
    page.deptment = access.msg
    page.user = access.id
      
    }else  if(ch.v == "Page2"){
      var sheetData = projectSheet.getRange('A2:H').getValues().filter(e=>e[0] == ch.evt)[0]
      
      const access = mailIDS();
      page.deptment = access.msg
      page.user = access.id
      
      page.project_Name = sheetData[0] 
      page.project_Manager = sheetData[1]
      page.project_Type = sheetData[4]
      page.service_type = sheetData[5]
      page.link = sheetData[7]
      }
     return page
   .evaluate()
   .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
   .addMetaTag('viewport', 'width=device-width, initial-scale=1, shrink-to-fit=no')
   .setTitle('PROJECT MANAGEMENT')
}

function mailIDS(){
  const response = {status:false};
  var ids = dataSheet.getRange("D9:E"+dataSheet.getLastRow()).getValues().filter(e=>e[0]!="")
  var email = Session.getActiveUser().getEmail()
  var dept = ids.find((e)=>e[0]==email)
  response.id = email;
  if(dept==undefined)
    response.msg = 'Not Found'
  else{
    response.status=true
    response.msg = dept[1].trim() == ""?"Not Found":dept[1]
  }
  console.log(response)
  return response;
}

function include(file){
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}

function test (){
  var templateSheet = SpreadsheetApp.openById('1chYMSWc5iIpt6yUa4zuM1rA8Fvq4KRmK5BgWapyAjIU')
}


function setProjectData(pro){
  var mainFolderId = setting.getRange('B1').getValue()
  var templateID = setting.getRange('B2').getValue()
  var templateSheet = SpreadsheetApp.openById(templateID)
  var  mainFolder = DriveApp.getFolderById(mainFolderId)
  var newSheet = templateSheet.copy(pro[0])
 let pFolder = DriveApp.createFolder(pro[0]).setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT);
 pFolder.moveTo(mainFolder)
 DriveApp.getFileById(newSheet.getId()).moveTo(pFolder)
 
 var l = projectSheet.getRange("A1:A").getValues().filter(e=>e[0] !="").flat().length

  projectSheet.getRange(l+1,1,1,10).setValues([[...pro,newSheet.getUrl(),pFolder.getUrl(),pFolder.getId()]])

  var ss = SpreadsheetApp.openByUrl(newSheet.getUrl())
  var pSheet =  ss.getSheetByName("Project Sheet")
  pSheet.getRange('E3').setValue(pro[6])
  pSheet.getRange("A1:C1").setValues([[pro[4],pro[5],pro[1]]])

  var projectTypes = setting.getRange(5,2,1,setting.getLastColumn()-1).getValues().flat()  
  var index = projectTypes.indexOf(pro[4])+1
    var projectData = setting.getRange(6,1,setting.getLastRow()-5,setting.getLastColumn()).getValues() 
      console.log(projectData.length)

  var resultArray = projectData.map(function(subarray) {
    return [subarray[0], subarray[index].toString()];
});
Logger.log(resultArray)

pSheet.getRange(3,2,resultArray.length,2).setValues(resultArray)

}

function getProjects(){
  var pr = projectSheet.getLastRow()
  var projects = pr>1?projectSheet.getRange(2,1,pr-1,11).getDisplayValues().filter(e=>e[0]!= "" && e[10] != 100):[];
  Logger.log(projects)
  return projects;
}
function getProjects2(){
  var pr = projectSheet.getLastRow()
  var projects = pr>1?projectSheet.getRange(2,1,pr-1,11).getDisplayValues().filter(e=>e[0]!= "" && e[10] == 100):[];
  Logger.log(projects)
  return projects;
}

function sheetLink(projectName="Shut"){
  var data = projectSheet.getRange("A2:H").getValues().filter(e=>e[0] == projectName)
  const sh = SpreadsheetApp.openByUrl(data[0][7]).getSheetByName('Project Sheet');
  const sData = sh.getRange('A3:I').getDisplayValues().filter(e=>e[0] !== "");
  const color = sh.getRange('A3:A'+sh.getLastRow()).getBackgrounds();
  const codes = {};
  for(var i=0;i<sData.length;i++){
    if(codes[sData[i][0]]==undefined)
      codes[sData[i][0]]=color[i][0]
  }
  return [sData,codes];
}

function deleteCard(clickedCard){
  Logger.log(clickedCard)
var  clickedEvent = projectSheet.getRange(2,1,projectSheet.getLastRow()-1,11).getValues().filter(e=> (e[0] == clickedCard)).flat()
var eventName =   projectSheet.getRange(2,1,projectSheet.getLastRow()-1,1).getValues().flat()
Logger.log(eventName)
var indx = eventName.indexOf(clickedCard)
Logger.log(indx+2)
projectSheet.deleteRow(indx+2)
Logger.log(clickedEvent[10])
DriveApp.getFolderById(clickedEvent[9]).setTrashed(true)
}


