/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');


class TumhashContract extends Contract {

    async exists(ctx, id) {
        const buffer = await ctx.stub.getState(id);
        return (!!buffer && buffer.length > 0);
    }
    /**
     * @param {*} ctx
     * @param {string} key
     * @param {string} email
     * @param {string} matriculation
     * @param {string} role
     * @returns
     */
    async RegisterUser(ctx, email, matriculation, role) {
        //check if user already exists
        let memberAsBytes = await ctx.stub.getState(matriculation);
	if (memberAsBytes.length > 0) {
		throw new Error('member already exists');
	}
        //add member to the ledger
        if (memberAsBytes.length <= 0) {
            const user = {
                Email: email,
                Name: matriculation,
                DocType: 'User',
                isLoggedIn: false,
                Role: role.toString(),// Student - Tutor - Professor
                Windowreceived: [],
                WindowSent: []
            };
            //get the private key from the user
            let transientKey = ctx.stub.getTransient();
            if (transientKey.size === 0 || !transientKey.has('privateValue')) {
                throw new Error('The privateValue key was not specified in transient data. Please try again.');
            }
            transientKey = transientKey.get('privateValue').toString();
            const keyUser = {
                matriculation: matriculation,
                key: transientKey,
            };
            await ctx.stub.putState(matriculation, Buffer.from(JSON.stringify(user)));
            await ctx.stub.putPrivateData(`keys_${role}`, matriculation, Buffer.from(JSON.stringify(keyUser)));
            return 'User sucessfully registered';
        } else {
            return 'User already exists or matriculation already taken';
        }
    }
    /**
     * @param {*} ctx
     * @param {*} hashExam
     * @param {*} studentId
     * @param {*} access_policy
     * @param {*} description
     * @param {*} examId
     * @param {*} examSubject
     */
    async uploadExamFile(ctx, hashExam, studentId, access_policy, description, examId, examSubject) {
        let exists = await this.exists(ctx, studentId);
        if (exists === false) {
            throw new Error(`Student: ${studentId} doesn't exist`);
        }
        exists = await this.exists(ctx, examId);
        if (exists) {
            throw new Error(`Exam: ${examId} already exist`);
        }
        const exam = {
            ExamId: String(examId),
            ExamSubject: String(examSubject),
            HashExam: hashExam,
            StudentId: studentId,
            Access_policy: access_policy,
            TotalPoints: 0,
            description: description,
            Complaints: [],
        };
        await ctx.stub.putState(examId, Buffer.from(JSON.stringify(exam)));
    }

    /**
     * @param {*} ctx
     * @param {*} hashExam
     * @param {*} studentId
     * @param {*} access_policy
     * @param {*} description
     * @param {*} examId
     * @param {*} examSubject
     *
     *
     * send a message between users using one secret key (passed off-chain)
     */
    async sendReviewMessage(ctx, userId, target, message) {
        //get the private key from the user
        let transientKey = ctx.stub.getTransient();
        if (transientKey.size === 0 || !transientKey.has('privateValue')) {
            throw new Error('The privateValue key was not specified in transient data. Please try again.');
        }
        transientKey = transientKey.get('privateValue').toString();
        //get all receipients
        let receipients = target.split(',');
        //check sender identity
        let userBytes = await ctx.stub.getState(userId);
        let user = JSON.parse(userBytes);
        const timestamp = '-';
        for (let i = 0; i < receipients.length; i++) {
            let targetByte = await ctx.stub.getState(receipients[i]);
            if (targetByte.length < 0) {
                return 'there is no such user with id: ' + receipients[i] + ' to send to';
            }
            let target = JSON.parse(targetByte);
            const objToHash = {
                matriculation: receipients[i],
                key: transientKey
            };
            const hashToVerify = crypto.createHash('sha256').update(JSON.stringify(objToHash)).digest('hex');
            const pdHashBytes = await ctx.stub.getPrivateDataHash(`keys_${target.Role}`, receipients[i]);
            if (pdHashBytes.length === 0) {
                throw new Error('No private data hash with the key: ' + receipients[i]);
            }
            const actualHash = Buffer.from(pdHashBytes).toString('hex');

            if (hashToVerify === actualHash) {

                let reviewMessage = {
                    Message: message,
                    Time: timestamp,
                    From: userId,
                    To: receipients[i],
                    isOpen: false,
                };
                target.Windowreceived.push(reviewMessage);
                await ctx.stub.putState(receipients[i], Buffer.from(JSON.stringify(target)));
                const messageLog = {
                    Sender: userId,
                    Receiver: receipients[i],
                    Time: timestamp
                };
                await ctx.stub.setEvent('review message sending', Buffer.from(JSON.stringify(messageLog)));
                let sentMessage = {
                    Message: message,
                    Time: timestamp,
                    From: userId,
                    To: receipients[i],
                    ReadBy: [],
                };
                user.WindowSent.push(sentMessage);
                await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
                return 'review message sent successfully';
            }
        }
    }
    //remove a message from a user profile 
    async receiveReviewMessage(ctx, userId) {
        let userAsBytes = await ctx.stub.getState(userId);
        if (!userAsBytes || userAsBytes.toString().length <= 0) {
            return 'User with id: ' + userId + ' doesnt exist';
        }
        let user = JSON.parse(userAsBytes);
        if (user.Windowreceived <= 0) {
            return 'no unseen messages in the queue';
        }

        let receivedMessages = user.Windowreceived;
        for (let i = 0; i < receivedMessages.length; i++) {
            if (!receivedMessages[i].isOpen) {
                let sender = await ctx.stub.getState(receivedMessages[i].From);
                let senderJSON = JSON.parse(sender);
                let sentData = senderJSON.WindowSent;
                let index = sentData.findIndex(
                    (val) => val.Time === receivedMessages[i].Time
                );
                sentData[index].ReadBy.push(receivedMessages[i].To);
                sender.WindowSent = sentData;
                await ctx.stub.putstate(
                    receivedMessages[i].From,
                    Buffer.from(JSON.stringify(sender))
                );
                user.receiveReviewMessage[i].isOpen = true;
                await ctx.stub.putstate(
                    userId,
                    Buffer.from(JSON.stringify(user))
                );
            }
        }
        return user;
    }

    //add multiple complaint assets
    async addComplaints(ctx, studentID, examId, messages) {
	
	//check that exam id exists
        let examAsBytes = await ctx.stub.getState(examId);
        let exam = JSON.parse(examAsBytes);
        if (exam.StudentId !== studentID) {
            throw new Error('examId: ' + examId + ' doesnt belong to student with id: ' + studentID);
        }

	//check that subject id exists
        let subjectAsBytes = await ctx.stub.getState(exam.ExamSubject);
        if (subjectAsBytes.length <= 0) {
            throw new Error('examSubject:' + exam.examSubject + ' doesnt exist');
        }
        let subject = JSON.parse(subjectAsBytes);
	if (subject.length === 0) {
	    throw new Error('Parsing error in subject');
	}
	//timestamp created issues for the validation phase: during the execution phase each peer will have a different timestamp if the send rate of transactions is high (over 30 transactions per second)
        const timestamp = '-';
	let complains;
	try {
	    complains = JSON.parse(messages);
	}
	catch (e){
	    throw new Error(e.message);
	}
	//iterate over the complaints entered by the student (complaints entered as JSON object) and add them to the ledger individually
        for (let [key, value] of Object.entries(complains)) {
            console.log(`${key}: ${value}`);
            let question = parseInt(key.substring(1));
	    //check that complaint number is not about an inexistant question in the subject
            if (question > Object.keys(subject).length) {
                throw new Error(`question: ${question} doesn't exist in the exam with id ${examId} and ${Object.keys(subject)} questions`);
            }
            let complain = {
                ExamId: examId,
                Time: timestamp,
                Question: `${key}`,
                Message: `${value}`,
                Status: 'submitted'
            };
            let complaintId = complain.Question + examId;
            await ctx.stub.putState(complaintId, Buffer.from(JSON.stringify(complain)));
        }
        console.log('review submitted successfully');
    }

    //called whenever an exam is visited or downloaded 
    async addAccessRecord(ctx, id, requester, operation) {
        const timestamp = Date.now();
        const logId = 'I' + id;
        let currentRecord = await ctx.stub.getState(logId);
        let accRecList = currentRecord + ',' + requester + '+' + operation + '+' + timestamp;
        await ctx.stub.putState(logId, Buffer.from(accRecList));
    }
    async addExamSubject(ctx, id, ratingSchema) {
        await ctx.stub.putState(id, Buffer.from(ratingSchema));
    }
    //called by tutors: update question status from "PENDING" to "ACCEPTED"
    async updateComplaint(ctx, complaintId, userId, status) {
        //check tutor exist
        let userAsBytes = await ctx.stub.getState(userId);
        let user = JSON.parse(userAsBytes);
        if (user.Role !== 'tutor') {
            throw new Error('Only tutors are authorized to perform update operations on complaints');
        }
        //check complaint exist
        let complainAsBytes = await ctx.stub.getState(complaintId);
        let complaint = JSON.parse(complainAsBytes);
        complaint.status = status;
        await this.addAccessRecord(ctx, complaintId, userId, 'update');
        await ctx.stub.putState(complaintId, Buffer.from(JSON.stringify(complaint)));
    }
    //update exam points according to subject grading scheme 
    async updateExamPoints(ctx, examId) {
	//check exam exist
        let examAsBytes = await ctx.stub.getState(examId);
        if (examAsBytes.length < 0) {
            throw new Error('Exam with id: ' + examId + ' doesnt exist');
        }
        //check that exam subject exist
        let exam = JSON.parse(examAsBytes);
        let examSubjectAsBytes = await ctx.stub.getState(exam.examSubjectId);
        let examSubject = JSON.parse(examSubjectAsBytes);
        let examComplaintsIdArray = exam.Complaints;
        for (let i = 0; i < examComplaintsIdArray.length; i++) {
            let complaintAsByte = await ctx.stub.getState(examComplaintsIdArray[i]);
            let complaint = JSON.parse(complaintAsByte);
            if (complaint.status === 'accepted') {
                let questionNumber = complaint.complaintId.substring(0, 2);
                let pointsToAdd = examSubject[questionNumber];
                exam.TotalPoints = exam.TotalPoints + pointsToAdd;
            }
        }
    }
}

module.exports = TumhashContract;
