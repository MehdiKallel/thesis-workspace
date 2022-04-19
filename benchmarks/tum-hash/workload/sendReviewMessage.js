'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

let users = require('./generatedData/users.json');
let complaints = require('./generatedData/complaints.json');
let subjectsIds = [];
let studentsExams = [];
let studentsKeys = [];
let tutorKeys = [];

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        // registering students, tutors and professors
        const asset_properties = {
            orderReference: orderReferenceGlobal,
            value: "100",
            status: "PENDING"
        };

        const asset_properties_string = JSON.stringify(asset_properties);

        const myArgs = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'verifyOrderDetails',
            invokerIdentity: 'User1',
            transientMap: { 'asset_properties': asset_properties_string },
            contractArguments: [orderSellerGlobal, orderReferenceGlobal],
        };
        for (let i = 0; i < users.length; i++) {
            console.log(`Worker ${this.workerIndex}: registering user ${users[i].matriculation} with role as ${users[i].role}`);
            let secretKey = Date.now();
            let myArgs = {
                contractId: this.roundArguments.contractId,
                channel: 'mychannel',
                transientMap: { 'privateValue': key.toString() },
                contractFunction: 'RegisterUser',
                contractArguments: [users[i].key, users[i].email, users[i].matriculation, users[i].role],
                timeout: 30
            };
            if (users[i].role == 'Student') {
                studentsKeys.push([users[i], secretKey]);
            } else {
                tutorKeys.push(secretKey);
            }
            await this.sutAdapter.sendRequests([users[i], secretKey]);
        }
    }
    async submitTransaction() {
        let sender = studentsKeys[Math.floor(Math.random() * studentsKeys.length)][0];
        let receiver = tutorKeys[Math.floor(Math.random() * tutorKeys.length)][0];
        let secretKey = receiver[1];

        //message

        let complaint = complaints[Math.floor(Math.random() * complaints.length)];
        
        const myArgs1 = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'sendReviewMessage',
            transientMap: { 'privateValue': secretKey.toString(),
            contractArguments: [student, examId, JSON.stringify(complaint)],
        };
        await this.sutAdapter.sendRequests(myArgs1);
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
