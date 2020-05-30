const fs = require('fs');
const path = require('path');

const OUTPUT_SIZE_MAP = {
    '64kb': 0.25,
    '128kb': 0.5,
    '256kb': 1,
    '512kb': 2,
    '1mb': 4,
    '2mb': 8,
};

class RomConversionService {
    static realToEmulator(inputFiles, outputFile, force, outputSize, twoFiveSixKb) {
        const inFiles = [];
        let outFile;

        try {
            inputFiles.forEach((input) => inFiles.push(fs.readFileSync(input)));
            if (fs.existsSync(outputFile) && !force) {
                throw Error('output file already exists');
            }

            outFile = fs.openSync(outputFile, 'w');

            const outputSizeBytes = OUTPUT_SIZE_MAP[outputSize] * twoFiveSixKb;
            const repeatTimes = Math.max(outputSizeBytes / inFiles[0].length / inFiles.length, 1);
            const repeatSize = outputSizeBytes / repeatTimes / inFiles.length;

            for (let repeat = 0; repeat < repeatTimes; repeat++) {
                for (let idx = 0; idx < repeatSize; idx += 2) {
                    inFiles.forEach((fileContent) => {
                        fs.writeSync(outFile, fileContent, idx + 1, 1, null);
                        fs.writeSync(outFile, fileContent, idx, 1, null);
                    });
                }
            }
        } catch (err) {
            Logger.error(err.message);
            Logger.debug(JSON.stringify(err));
            Logger.trace(err.stack);
        } finally {
            if (outFile) {
                fs.closeSync(outFile);
            }
        }
    }

    static emulatorToReal(inputFile, outputFile, force, outputSize, split, twoFiveSixKb) {
        const outFileContents = [];
        let inFile;

        try {
            const outFiles = [];
            let numOutputs = 1;
            if (split) {
                numOutputs = 2;
                const outputBase = path.join(path.dirname(outputFile), path.basename(outputFile));
                outFiles.push(path.join(`${outputBase}_HI_A`, path.extname(outputFile)));
                outFiles.push(path.join(`${outputBase}_LO_B`, path.extname(outputFile)));
            } else {
                outFiles.push(outputFile);
            }

            inFile = fs.readFileSync(inputFile);
            for (let outFileIdx = 0; outFileIdx < outFiles.length; outFileIdx++) {
                const outFile = outFiles[outFileIdx];
                if (fs.existsSync(outFile) && !force) {
                    throw Error(`output file "${outFile}" already exists`);
                }
                outFileContents.push(fs.openSync(outFile, 'w'));
            }

            const outputSizeBytes = OUTPUT_SIZE_MAP[outputSize] * twoFiveSixKb;
            const repeatTimes = Math.max((outputSizeBytes * numOutputs) / inFile.length, 1);
            const repeatSize = Math.min(inFile.length, (outputSizeBytes * numOutputs));

            for (let repeat = 0; repeat < repeatTimes; repeat++) {
                for (let idx = 0; idx < repeatSize; idx += (4 / (3 - numOutputs))) {
                    for (let outFileIdx = 0; outFileIdx < numOutputs; outFileIdx++) {
                        fs.writeSync(outFileContents[outFileIdx], inFile, idx + 1 + (2 * outFileIdx), 1, null);
                        fs.writeSync(outFileContents[outFileIdx], inFile, idx + (2 * outFileIdx), 1, null);
                    }
                }
            }
        } catch (err) {
            Logger.error(err.message);
            Logger.debug(JSON.stringify(err));
            Logger.trace(err.stack);
        } finally {
            outFileContents.forEach((outFile) => {
                fs.closeSync(outFile);
            });
        }
    }
}

module.exports = RomConversionService;
