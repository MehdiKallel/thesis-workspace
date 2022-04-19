'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
let payloads = require('./complaints.json');
let assetIds = [];


class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
	const payloadId = Date.now().toString(36);
	const payloadIndex = Math.floor(Math.random() * payloads.length);
	const payload = payloads[payloadIndex];
	console.log(`Worker ${this.workerIndex}: writing data with a size of ${Buffer.byteLength(JSON.stringify(payload))} Bytes - PDC: No / Transient Field: Yes`);
        const myArgs = {
            contractId: 'simplepayload',
	    channel: 'mychannel',
	    contractVersion: 'v1',
            contractFunction: 'Init',
            contractArguments: [payloadId, Buffer.from(JSON.stringify(payload))],
	    timeout: 29
        };
	assetIds.push(payloadId);
        await this.sutAdapter.sendRequests(myArgs);
    }
    async submitTransaction() {
	const payloadId = Date.now().toString(36);
	const payloadIndex = Math.floor(Math.random() * payloads.length);
	const payload = payloads[payloadIndex];
	console.log(`Worker ${this.workerIndex}: writing data with a size of ${Buffer.byteLength(JSON.stringify(payload))} Bytes - PDC: No / Transient Field: Yes`);
        const myArgs = {
            contractId: 'simplepayload',
	    contractVersion: 'v1',
	    channel: 'mychannel',
            contractFunction: 'writePayloadPublic',
            contractArguments: [payloadId, Buffer.from(JSON.stringify(payload))],
	    timeout: 29
        };
	assetIds.push(payloadId);
        await this.sutAdapter.sendRequests(myArgs);
    }
     async cleanupWorkloadModule() {
        for (let i=0; i<assetIds.length; i++) {
            console.log(`Worker ${this.workerIndex}: Deleting payload ${assetIds[i]}`);
            const request = {
                contractId: this.roundArguments.contractId,
		channel: 'mychannel',
		contractVersion: 'v1',
                contractFunction: 'deletePayloadPublic',
                contractArguments: [assetIds[i]],
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
