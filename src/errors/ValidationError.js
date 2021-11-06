class ValidationError extends Error {
    constructor(validationErrors) {
        super('Validation error');
        this.validationErrors = validationErrors;
    }
}

module.exports = ValidationError;
