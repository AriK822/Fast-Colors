function initTestDelay(delay=1000){
    async function addTestDelay(req, res, next){
        await new Promise((resolve) => setTimeout(resolve, delay))
        next();
    }
    return addTestDelay
}


export default initTestDelay
