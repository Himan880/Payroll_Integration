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
		var employeeID;
		var projectInternalId;
                var taskInternalId;
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
                var taskNameSummary = taskresponseBody.issues[taskCount].fields.summary;
                var projecttaskSearchObj = search.create({
                    type: "projecttask",
                    filters: [
                        ["title", "is", taskNameSummary]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = projecttaskSearchObj.runPaged().count;
                log.debug("projecttaskSearchObj result count", searchResultCount);
                projecttaskSearchObj.run().each(function(result) {
                    taskInternalId = result.getValue({
                        name: "internalid"
                    });
                    // .run().each has a limit of 4,000 results
                    return true;
                });
                var allocationresourceproject = taskresponseBody.issues[taskCount].fields.assignee.displayName;
                log.debug('allocationresourceproject', allocationresourceproject);

                
                var employeeSearchObj = search.create({
                    type: "employee",
                    filters: [
                        ["entityid", "is", allocationresourceproject]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = employeeSearchObj.runPaged().count;
                log.debug("employeeSearchObj result count", searchResultCount);
                employeeSearchObj.run().each(function(result) {
                    employeeID = result.getValue({
                        name: "internalid"
                    });
                    var resourceallocationSearchObj = search.create({
                        type: "resourceallocation",
                        filters: [
                            ["resource", "anyof", employeeID],
                            "AND",
                            ["project", "anyof", projectInternalId],
                            "AND",
                            ["projecttask", "anyof", taskInternalId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "internalid",
                                label: "Internal ID"
                            })
                        ]
                    });
                    var searchResultCount = resourceallocationSearchObj.runPaged().count;
                    log.debug("resourceallocationSearchObj result count", searchResultCount);
                    if (searchResultCount == 0 || searchResultCount == null) {
                        var resourceAllocationRecord = record.create({
                            type: "resourceallocation"
                        });
						log.debug('inside the resource condition');
						log.debug('inside the resource condition',employeeID);
						log.debug('inside the resource condition',projectInternalId);
						log.debug('inside the resource condition',taskInternalId);
						
                        resourceAllocationRecord.setValue({
                            fieldId: 'allocationresource',
                            value: employeeID
                        });
                        resourceAllocationRecord.setValue({
                            fieldId: 'project',
                            value: projectInternalId
                        });
                        resourceAllocationRecord.setValue({
                            fieldId: 'projecttask',
                            value: taskInternalId
                        });

                        resourceAllocationRecord.setValue({
                            fieldId: 'allocationamount',
                            value: 0
                        });
                        var resourceAllocationRecordId = resourceAllocationRecord.save();
                        log.debug('resourceAllocationRecordId', resourceAllocationRecordId);
                    }
                    // .run().each has a limit of 4,000 results
                    return true;
                });




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