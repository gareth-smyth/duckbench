class RedirectInputFile {
    structure() {
        return {
            name: 'RedirectInputFile',
            label: 'Creates a file of text separated by newlines',
            description: 'Creates a file that can be directed as input ' +
                'to simulate the user hitting the keys',
            type: 'internal',
        };
    }

    async createInput(arrayOfInput, communicator, location = 'ram:tmpinput') {
        await communicator.echo(arrayOfInput.join('*n') + '*n', {REDIRECT_OUT: location});
        return location;
    }
}

module.exports = RedirectInputFile;
