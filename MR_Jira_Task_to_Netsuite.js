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
        // log.debug('headerObj', headerObj);

        var accessToken1 = [];
        accessToken1.push(headerObj);
        return accessToken1;
    }

    function map(context) {
        var headerObj = {
            "Authorization": "Basic cmlzaGFiaC5nYXVyQGNpbm50cmEuY29tOkFUQVRUM3hGZkdGMDZJeEJ3Mkk0cUZSSnFlc1l4bDlKSzJrZG1TY1dsMTBYZ21lbTBPbUhWYUtSeUh6RXIwWkRlMzdEY0JJVHYxQzNYSUplckxNQ0tRb2NmNjIzMmt1LVRlazhJYnl6MXREOHFkSVVDUTh0ZGlWWlBwSkVxZ1BISTM1NG15d3I3UXF2dXJzYlY5WlBXNW1lRkxJbDlnNmN6VDM1a3JyRHQ4VVN6aWxNbW44UVBkdz1DQ0E3Qjc0Rg==",
            "Content-Type": "application/json;",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Length": "10000"
        };
        var projectResponse = https.get({
            url: 'https://rishabhgaur.atlassian.net/rest/api/3/project',
            headers: headerObj
        });
        //log.debug('projectResponse',projectResponse);	
        var responseBody = JSON.parse(projectResponse.body);
        //log.debug('responseBody',responseBody);
        var responseCount = responseBody.length;
        //log.debug('responseCount',responseCount);
        for (var i = 0; i < responseCount; i++) {
            var projectName = responseBody[i].name;
            log.debug('projectName', projectName);
            var projectId = responseBody[i].id;
            log.debug('projectId', projectId);

            var taskResponse = https.get({
                url: 'https://rishabhgaur.atlassian.net/rest/api/2/search?jql=project=' + projectName + '&maxResults=1000',
                headers: headerObj
            });
            //log.debug('taskResponse',taskResponse);	
            var taskresponseBody = JSON.parse(taskResponse.body);
            //log.debug('taskresponseBody',taskresponseBody);

            var taskIssues = taskresponseBody.issues;
            //log.debug('taskIssues',taskIssues);
            var taskIssuesLength = taskresponseBody.issues.length;
            log.debug('taskIssuesLength', taskIssuesLength);
            for (var taskCount = 0; taskCount < taskIssuesLength; taskCount++) {
                var taskName = taskresponseBody.issues[taskCount].fields.summary;
                log.debug('taskName', taskName);

                var projecttaskSearchObj = search.create({
                    type: "projecttask",
                    filters: [
                        ["job.entityid", "is", projectName],
                        "AND",
                        ["title", "is", taskName]
                    ],
                    columns: [
                        search.createColumn({
                            name: "id",
                            sort: search.Sort.ASC,
                            label: "ID"
                        })
                    ]
                });
                var searchResultCount = projecttaskSearchObj.runPaged().count;
                log.debug("projecttaskSearchObj result count", searchResultCount);
                var projectInternalId;
                if (searchResultCount == 0 || searchResultCount == null || searchResultCount == " ") {
                    var jobSearchObj = search.create({
                        type: "job",
                        filters: [
                            ["entityid", "is", projectId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    });
                    var searchResultCount = jobSearchObj.runPaged().count;
                    log.debug("jobSearchObj result count", searchResultCount);
                    jobSearchObj.run().each(function(result) {
                        projectInternalId = result.getValue({
                            name: "internalid"
                        })
                       
                        return true;
                    });
                    var taskRecord = record.create({
                        type: record.Type.PROJECT_TASK
                    });
                    taskRecord.setValue({
                        fieldId: 'company',
                        value: projectInternalId
                    });
                    taskRecord.setValue({
                        fieldId: 'title',
                        value: taskName
                    });

                    taskRecord.setValue({
                        fieldId: 'plannedwork',
                        value: 0
                    });
                    var taskId = taskRecord.save();
                    log.debug('taskId', taskId);
					
					
                }
				// var allocationresourceproject = taskresponseBody.issues[taskCount].fields.assignee.displayName;
				// log.debug('allocationresourceproject',allocationresourceproject);
				// var taskNameSummary = taskresponseBody.issues[taskCount].fields.summary;
				 // var resourceAllocationRecord = record.create({
                        // type: record.Type.RESOURCE_ALLOCATION
                    // });
                    // resourceAllocationRecord.setText({
                        // fieldId: 'allocationresource',
                        // value: allocationresourceproject
                    // });
                    // resourceAllocationRecord.setValue({
                        // fieldId: 'project',
                        // value: projectInternalId
                    // });
					// resourceAllocationRecord.setText({
                        // fieldId: 'projecttask',
                        // value: taskNameSummary
                    // });

                    // resourceAllocationRecord.setValue({
                        // fieldId: 'allocationamount',
                        // value: 8
                    // });
                    // var resourceAllocationRecordId = resourceAllocationRecord.save();
                    // log.debug('resourceAllocationRecordId', resourceAllocationRecordId);
				
				

            }

        }




    }

    function reduce(context) {}
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