type ResolveFunction<T> = (result?: T) => void
type RejectFunction = (error: Error) => void
type ThenHandlerReturnType<U> = U|PromiseNishant<U>|undefined
type ThenSuccessHandler<T, U> = (res?: T) => ThenHandlerReturnType<U>
type ThenFailureHandler<U> = (error?: Error) => ThenHandlerReturnType<U>
type ThenSuccessOrFailureHandler<T, U> = (result?: T|Error) => ThenHandlerReturnType<U>


export default class PromiseNishant<T> {

    private state: 'resolved' | 'rejected' | 'pending' = 'pending'
    private resolvedValue?: T
    private rejectedValue?: Error
    private doneSuccess?: (result?: T) => any
    private doneFailure?: (error?: Error) => void


    constructor (func: (resolve: ResolveFunction<T>, reject: RejectFunction) => void) {
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

    private thenHelper<U>(resolve: ResolveFunction<U>, reject: RejectFunction, func: ThenSuccessOrFailureHandler<T,U>, res?: T|Error) {
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

    then<U> (success?: ThenSuccessHandler<T, U>, failure?: ThenFailureHandler<U>): PromiseNishant<U> {
        return new PromiseNishant<U>((resolve, reject) => {
            const defaultSuccessHandler: ThenSuccessHandler<T, T> = res => res
            const defaultFailureHandler: ThenFailureHandler<undefined> = err => {throw err}
            this.done(
                res => this.thenHelper<T|U>(resolve, reject, success || defaultSuccessHandler, res), 
                err => this.thenHelper(resolve, reject, failure || defaultFailureHandler, err)
            )
        })
    }

    catch<U> (failure?: (error?: Error) => U | PromiseNishant<U>): PromiseNishant<U> {
        return this.then<U>(undefined, failure)
    }

}