'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

let users;
let complaints = require('./complaints.json');
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
	
        // this.roundArguments.subjects: max number of subjects objects to add / this.roundArguments.maxKeys: max Keys per subject
        for (let i = 0; i < this.roundArguments.subjects; i++) {
            //add random number of subjects
            const numberOfKeys = 10;
            //Math.floor(Math.random() * this.roundArguments.maxKeys);
            let generatedObj = {};
            for (let i = 0; i < numberOfKeys; i++) {
                generatedObj['Q' + i] = 4;
            }
            const subjectId = Date.now().toString(36);
            subjectsIds.push(String(subjectId));
	    console.log(`Worker ${this.workerIndex}: adding subject id: ${subjectId}`);
            let myArgs1 = {
                contractId: this.roundArguments.contractId,
                channel: 'mychannel',
		contractVersion: 'v1',
                contractFunction: 'addExamSubject',
                contractArguments: [String(subjectId), Buffer.from(JSON.stringify(generatedObj))],
                timeout: 30
            };
            await this.sutAdapter.sendRequests(myArgs1);
        }
        // we suppose each student will upload a max number of 10 exams
        // each student upload a random number of exams/random number of complaints per exam hashExam, studentId, access_policy, description, examId, examSubject
        for (let i = 0; i < users.length; i++) {
            let numberOfExams = 10;
	    console.log(`Worker ${this.workerIndex}: user ${users[i].matriculation} adding ${numberOfExams} exams`);
            for (let i = 0; i < numberOfExams; i++) {
                //(ctx, hashExam, studentId, access_policy, description, examId, examSubject)
		const index = Math.floor(Math.random() * subjectsIds.length);
		const subjectId = subjectsIds[index];
                const examId = Date.now().toString(36);
                const examHash = 'hash' + examId;
                studentsExams.push([String(users[i].matriculation), String(examId)]);
                console.log(`Worker ${this.workerIndex}: uploading exam ${examId} as Student ${users[i].matriculation}`);
                const myArgs2 = {
                    contractId: this.roundArguments.contractId,
                    channel: 'mychannel',
                    contractVersion: 'v1',
                    contractFunction: 'uploadExamFile',
                    contractArguments: [examHash, String(users[i].matriculation), '-', '-', String(examId), String(subjectId)],
                    timeout: 30
                };
                await this.sutAdapter.sendRequests(myArgs2);
            }
        }
    }
    async submitTransaction() {
        const randomIndex = Math.floor(Math.random() * studentsExams.length);
        const randomComplaint = Math.floor(Math.random() * complaints.length);
        const complaint = complaints[randomComplaint];
        const pick = studentsExams[randomIndex];
        const student = pick[0];
        const examId = pick[1];
        // generate complaint
	console.log('Sending transaction with a payload of ' + Buffer.byteLength(JSON.stringify(complaint)) + ' Bytes');
        const myArgs = {
            contractId: this.roundArguments.contractId,
	    contractVersion: 'v1',
            contractFunction: 'addComplaints',
            contractArguments: [student, examId, Buffer.from(JSON.stringify(complaint))],
        };
        await this.sutAdapter.sendRequests(myArgs);
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
