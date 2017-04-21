type ResultFunction<T> = (result?: T) => void
type RejectFunction = (error: Error) => void

export default class PromiseNishant<T> {

    private state: 'resolved' | 'rejected' | 'pending' = 'pending'
    private resolvedValue?: T
    private rejectedValue?: Error
    private doneSuccess?: (result?: T) => any
    private doneFailure?: (error?: Error) => void


    constructor (func: (resolve: ResultFunction<T>, reject: RejectFunction) => void) {
        func(res => this.resolve(res), err => this.reject(err))
    }

    private resolve (result?: T) {
        this.state = 'resolved'
        this.resolvedValue = result
        this.process()
    }

    private reject (err: Error) {
        this.state = 'rejected'
        this.rejectedValue = err
        this.process()
    }

    private process () {
        switch (this.state) {
            case 'resolved': return this.doneSuccess && this.doneSuccess(this.resolvedValue)
            case 'rejected': return this.doneFailure && this.doneFailure(this.rejectedValue)
        }
    }

    done<U> (success: (result?: T) => U, failure?: (error: Error) => void): void {
        this.doneSuccess = success
        this.doneFailure = failure
        this.process()
    }

    thenHelper<U>(resolve, reject, func: (result?: T|Error) => U|PromiseNishant<U>, res?: T|Error) {
        let ret: U | PromiseNishant<U> | undefined = undefined;
        try {
            ret = func(res)
        } catch (err) {
            reject(err)
            return
        }
        if (ret instanceof PromiseNishant)
            ret.done(resolve)
        else
            resolve(ret)
    }

    then<U> (success?: (result?: T) => U|PromiseNishant<U>, failure?: (error?: Error) => U|PromiseNishant<U>): PromiseNishant<U> {
        return new PromiseNishant<U>((resolve, reject) => {
            this.done(
                res => success && this.thenHelper(resolve, reject, success, res || undefined), 
                err => failure && this.thenHelper(resolve, reject, failure, err)
            )
        })
    }

    catch<U> (failure?: (error?: Error) => U | PromiseNishant<U>): PromiseNishant<U> {
        return this.then<U>(undefined, failure)
    }

}