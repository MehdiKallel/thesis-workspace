'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

let users = require('./generatedData/users.json');
let complaints = require('./generatedData/complaints.json');
let subjectsIds = [];
let studentsExams = [];

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        // registering students, tutors and professors
        for (let i = 0; i < users.length; i++) {
            console.log(`Worker ${this.workerIndex}: registering user ${users[i].matriculation} with role as ${users[i].role}`);
            let myArgs = {
                contractId: this.roundArguments.contractId,
                channel: 'mychannel',
                contractFunction: 'RegisterUser',
                contractArguments: [users[i].key, users[i].email, users[i].matriculation, users[i].role],
                timeout: 30
            };
            await this.sutAdapter.sendRequests(myArgs);
        }
        // this.roundArguments.subjects: max number of subjects objects to add / this.roundArguments.maxKeys: max Keys per subject
        for (let i = 0; i < this.roundArguments.subjects; i++) {
            //add random number of subjects
            let numberOfKeys = 10;
            //Math.floor(Math.random() * this.roundArguments.maxKeys);
            let generatedObj = {};
            for (let i = 0; i < numberOfKeys; i++) {
                generatedObj['Q' + i] = 4;
            }
            let subjectId = Date.now();
            subjectsIds.push(subjectId);
            let myArgs1 = {
                contractId: this.roundArguments.contractId,
                channel: 'mychannel',
                contractFunction: 'addExamSubject',
                contractArguments: [subjectId, Buffer.from(JSON.stringify(generatedObj))],
                timeout: 30
            };
            await this.sutAdapter.sendRequests(myArgs1);
        }
        // we suppose each student will upload a max number of 10 exams
        // each student upload a random number of exams/random number of complaints per exam hashExam, studentId, access_policy, description, examId, examSubject
        for (let i = 0; i < users.length; i++) {
            let numberOfExams = Math.floor(Math.random() * 10);
            for (let i = 0; i < numberOfExams; i++) {
                //(ctx, hashExam, studentId, access_policy, description, examId, examSubject)
                let subjectId = subjectsIds[Math.floor(Math.random() * subjectsIds.length)];
                let examId = Date.now();
                let examHash = 'hash' + examId;
                studentsExams.push([users[i].matriculation, examId]);
                console.log(`Worker ${this.workerIndex}: uploading exam ${examId} as Student ${users[i].matriculation}`);
                let myArgs2 = {
                    contractId: this.roundArguments.contractId,
                    channel: 'mychannel',
                    contractVersion: 'v1',
                    contractFunction: 'uploadExamFile',
                    contractArguments: [examHash, users[i].matriculation, '-', '-', examId, subjectId],
                    timeout: 30
                };
                await this.sutAdapter.sendRequests(myArgs2);
            }
        }
    }
    async submitTransaction() {
        let randomIndex = Math.floor(Math.random() * studentsExams.length);
        let randomComplaint = Math.floor(Math.random() * complaints.length);
        let complaint = complaints[randomComplaint];
        let pick = studentsExams[randomIndex];
        let student = pick[0];
        let examId = pick[1];
        // generate complaint
        const myArgs = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'addComplaints',
            contractArguments: [student, examId, JSON.stringify(complaint)],
        };
        await this.sutAdapter.sendRequests(myArgs);
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
