class HTree {
    constructor(codeLengths) {
        this.tree = new Array(510).fill({leaf: true});
        this.nextEntry = 0;
        this.allocated = 1;

        let currentCodeLen = 0;

        do {
            this.expandQueue();
            currentCodeLen += 1;
        } while (this.addCodesWithLength(codeLengths, currentCodeLen));
    }

    expandQueue() {
        const endOffset = this.allocated;

        while (this.nextEntry < endOffset) {
            this.tree[this.nextEntry] = {value: this.allocated};
            this.allocated += 2;
            this.nextEntry += 1;
        }
    }

    addCodesWithLength(codeLengths, currentCodeLen) {
        let codesRemaining = 0;

        for (let i = 0; i < codeLengths.length; i++) {
            if (codeLengths[i] === currentCodeLen) {
                const node = this.nextEntry;
                this.nextEntry += 1;

                this.tree[node] = {leaf: true, value: i};
            } else if (codeLengths[i] > currentCodeLen) {
                codesRemaining = 1;
            }
        }

        return codesRemaining;
    }

    /* This method is for debugging only */
    /* istanbul ignore next */
    displayTree(tree = this.tree, node = this.tree[0], inset = 0) {
        if (node.leaf) {
            Logger.debug(`${' '.repeat(inset)}leaf ${node.value}`);
        } else {
            Logger.debug(`${' '.repeat(inset)}0 ->`);
            this.displayTree(tree, tree[node.value], inset + 4);
            Logger.debug(`${' '.repeat(inset)}1 ->`);
            this.displayTree(tree, tree[node.value + 1], inset + 4);
        }
    }

    readCode(bitReader) {
        let code = this.tree[0];

        while (!code.leaf) {
            const bit = bitReader.read(1);
            code = this.tree[code.value + bit];
        }

        return code.value;
    }
}

module.exports = HTree;
