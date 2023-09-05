/** 
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript 
 */
define(['N/search', 'N/record', 'N/https'], function(search, record, https) {
    function getInputData() {
        var headerObj = {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded'
        };
        log.debug('headerObj', headerObj);
        
        var accessToken1 = [];
      accessToken1.push(headerObj);
        return accessToken1;
    }
    function map(context) {
			var headerObj = {
   "Authorization": "Basic cmlzaGFiaC5nYXVyQGNpbm50cmEuY29tOkFUQVRUM3hGZkdGMDZJeEJ3Mkk0cUZSSnFlc1l4bDlKSzJrZG1TY1dsMTBYZ21lbTBPbUhWYUtSeUh6RXIwWkRlMzdEY0JJVHYxQzNYSUplckxNQ0tRb2NmNjIzMmt1LVRlazhJYnl6MXREOHFkSVVDUTh0ZGlWWlBwSkVxZ1BISTM1NG15d3I3UXF2dXJzYlY5WlBXNW1lRkxJbDlnNmN6VDM1a3JyRHQ4VVN6aWxNbW44UVBkdz1DQ0E3Qjc0Rg==",
    "Content-Type": "application/json;",
		"Accept" : "*/*",
		"Accept-Encoding" : "gzip, deflate, br",
		"Content-Length" : "10000"
};
			
	var response = https.get({
    url: 'https://rishabhgaur.atlassian.net/rest/api/3/project',
    headers: headerObj
});
log.debug('response',response);	
var responseBody = JSON.parse(response.body);
log.debug('responseBody',responseBody);
var responseCount = responseBody.length;
log.debug('responseCount',responseCount);
for(var i = 0; i<responseCount; i++){
var projectId = responseBody[i].id;
log.debug('projectId',projectId);
var projectName = responseBody[i].name;
log.debug('projectName',projectName);
var jobSearchObj = search.create({
   type: "job",
   filters:
   [
      ["entityid","is",projectId]
   ],
   columns:
   [
      search.createColumn({name: "internalid", label: "Internal ID"})
   ]
});
var searchResultCount = jobSearchObj.runPaged().count;
log.debug("jobSearchObj result count",searchResultCount);
if(searchResultCount == 0 || searchResultCount == null || searchResultCount == " "){
	var projectRecord = record.create({
    type: record.Type.JOB,
    isDynamic: true
});
projectRecord.setValue({
	fieldId : 'customform',
	value : 147
});
projectRecord.setValue({
	fieldId : 'autoname',
	value : false
});
projectRecord.setValue({
	fieldId : 'entityid',
	value : projectId
});

projectRecord.setValue({
	fieldId : 'companyname',
	value : projectName
});
var projectID = projectRecord.save();
log.debug('projectID',projectID);

	
}
}
var Employeeresponse = https.get({
    url: 'https://rishabhgaur.atlassian.net/rest/api/3/users',
    headers: headerObj
});
//log.debug('Employeeresponse',Employeeresponse);	
var empresponseBody = JSON.parse(Employeeresponse.body);
//log.debug('empresponseBody',empresponseBody);
var emprecordLength = empresponseBody.length;
log.debug('emprecordLength',emprecordLength);
for(var empCount = 0; empCount<emprecordLength; empCount++){
	var empType = empresponseBody[empCount].accountType;
	//log.debug('empType',empType);
	if(empType == "atlassian"){
		var empName = empresponseBody[empCount].displayName;
	log.debug('empName',empName);
	var employeeSearchObj = search.create({
   type: "employee",
   filters:
   [
      ["entityid","is",empName]
   ],
   columns:
   [
      search.createColumn({name: "internalid", label: "Internal ID"})
   ]
});
var searchResultCount = employeeSearchObj.runPaged().count;
log.debug("employeeSearchObj result count",searchResultCount);
if(searchResultCount == 0 || searchResultCount == null || searchResultCount == " "){
	var empRecordCreate = record.create({
		type : record.Type.EMPLOYEE
	});
	empRecordCreate.setValue({
		fieldId : 'altname',
		value : empName
	});
	empRecordCreate.setValue({
		fieldId : 'isjobresource',
		value : true
	});
	var empRecordId = empRecordCreate.save();
	log.debug('empRecordId',empRecordId);
}
	}
	
	
}





        

    }
    function reduce(context) {
    }
    // The summarize stage is a serial stage, so this function is invoked only one time. 
    function summarize(context) {
        // Log details about the script’s execution. 
    }
    // Link each entry point to the appropriate function. 
    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

});