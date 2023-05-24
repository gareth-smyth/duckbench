const {parentPort} = require('worker_threads');
const {v4: uuid} = require('uuid');

class ProgressService {
    constructor(parent) {
        if (parent instanceof ProgressService) {
            this.parent = parent;
        }
        this.children = [];
        this.id = uuid();
    }

    addChild() {
        const childProgress = new ProgressService(this);
        this.children.push(childProgress);
        return childProgress;
    }

    setExpectations(title, expectedTime) {
        this.title = title;
        this.expectedTime = expectedTime;
    }

    getExpectedTime() {
        return this.children.reduce((total, child) => {
            return total + child.getExpectedTime();
        }, this.expectedTime);
    }

    getEstimatedRemaining() {
        const selfRemaining = (this.percentComplete && this.percentComplete !== 100) ?
            this.expectedTime * 100 / this.percentComplete : 0;
        return this.children.reduce((total, child) => {
            return total + child.getEstimatedRemaining();
        }, selfRemaining);
    }

    start() {
        if (this.title) {
            parentPort.postMessage({
                parentId: this.parent?.id,
                id: this.id,
                text: this.title,
                action: 'start',
                expectedTime: this.getExpectedTime(),
                estimatedRemaining: this.getEstimatedRemaining(),
            });
        }
    }

    notifyProgress() {
        if (this.title) {
            parentPort.postMessage({
                id: this.id,
                action: 'update',
                percentComplete: this.percentComplete,
                estimatedRemaining: this.getEstimatedRemaining(),
            });
        }

        if (this.parent) {
            this.parent.notifyProgress();
        }
    }

    progress(percentComplete) {
        this.percentComplete = percentComplete;
        this.notifyProgress();
    }
}

module.exports = ProgressService;
