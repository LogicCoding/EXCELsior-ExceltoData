class RequestError extends Error{
    constructor(message){
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

function errorHandler(err, req, res, next){
    if(err instanceof RequestError || err instanceof TypeError){
        res.status(500).send('Invalid request: ' + err.message);
    }
    else if(Object.hasOwn(err, "status")){
        res.status(502).send('Request to endpoint failed: ' + err.message);
    }
    else{
        res.status(500).send('Unknown error: ' + err.message);
    }
}

module.exports = { RequestError, errorHandler }