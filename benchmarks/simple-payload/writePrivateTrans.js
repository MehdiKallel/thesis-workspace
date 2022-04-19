'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
let payloads = require('./complaints.json');
let assetIds = [];

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex=0;
    }
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }
    async submitTransaction() {
        this.txIndex++;
        const payloadId = this.txIndex + '-' + this.workerIndex;
        const payloadIndex = Math.floor(Math.random() * payloads.length);
        const payload = payloads[payloadIndex];
        console.log(`Worker ${this.workerIndex}: writing data with a size of ${Buffer.byteLength(JSON.stringify(payload))} Bytes - PDC: Yes / Transient Field: Yes`);
        const myArgs = {
            contractId: 'simple-payload',
            contractVersion: 'v1',
            contractFunction: 'writePrivatePayloadTrans',
            contractArguments: [payloadId],
            transientMap: {'privateValue': Buffer.from(JSON.stringify(payload))}
        };
        assetIds.push(payloadId);
        await this.sutAdapter.sendRequests(myArgs);
    }

}

function createWorkloadModule() {
    return new MyWorkload();
}
module.exports.createWorkloadModule = createWorkloadModule;
