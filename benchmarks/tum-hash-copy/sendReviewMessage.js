'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
let complaints = require('./complaints.json');
let subjectsIds = [];
let studentsExams = [];
let studentsKeys = [];
let tutorKeys = [];
let users;



class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
	users = require(`./users${this.workerIndex}.json`);
            for (let i = 0; i < users.length; i++) {
                    console.log(`Worker ${this.workerIndex}: registering user ${users[i].matriculation} with role as ${users[i].role}`);
                    const secretKey = Date.now().toString(36);
                    const myArgs = {
                            contractId: 'tum-hash',
			    contractVersion: 'v1',
                            channel: 'mychannel',
                            transientMap: {'privateValue': Buffer.from(secretKey) },
                            contractFunction: 'RegisterUser',
                            contractArguments: [users[i].email, users[i].matriculation, users[i].role],
                            timeout: 29
                    };
                    if (users[i].role === 'Student') {
                            studentsKeys.push([String(users[i].matriculation), String(secretKey)]);
                    } else {
                            tutorKeys.push([String(users[i].matriculation), String(secretKey)]);
                    }
                    await this.sutAdapter.sendRequests(myArgs);
            } 
    }
    async submitTransaction() {
        const randomIndexDestination = Math.floor(Math.random() * tutorKeys.length);	
        const randomIndexSender = Math.floor(Math.random() * studentsKeys.length);
	const destination = tutorKeys[randomIndexDestination][0];
	const destinationKey = tutorKeys[randomIndexDestination][1];
	const sender = studentsKeys[randomIndexSender][0];
	let payloadIndex = Math.floor(Math.random() * complaints.length);
	console.log('payloadIndex is: ' + payloadIndex);
	console.log('file length is ' + complaints.length);
	let payload = complaints[payloadIndex];
	console.log(`Worker ${this.workerIndex}: sending a message with a payload of ${Buffer.byteLength(JSON.stringify(payload))} from Student ${sender} to Tutor ${destination} with private key ${destinationKey}`);
        const myArgs = {
            contractId: this.roundArguments.contractId,
	    contractVersion: 'v1',
	    transientMap: {'privateValue': Buffer.from(String(destinationKey))},
            contractFunction: 'sendReviewMessage',
            contractArguments: [sender, destination, Buffer.from(JSON.stringify(payload))],
        };
        await this.sutAdapter.sendRequests(myArgs);
    }
     async cleanupWorkloadModule() {
        for (let i=0; i<users.length; i++) {
            console.log(`Worker ${this.workerIndex}: Deleting user ${users[i].matriculation}`);
            const request = {
                contractId: this.roundArguments.contractId,
		contractVersion: 'v1',
                contractFunction: 'deleteTumhash',
                contractArguments: [String(users[i].matriculation)],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(request);
        }
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
