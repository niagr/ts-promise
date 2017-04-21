import PromiseNishant from './promise'

const setTimeoutPromise = (time: number) => 
	new PromiseNishant((resolve, reject) => setTimeout(_ => resolve(), time))

setTimeoutPromise(1000)
.then(_ => console.log('one'))
.then(_ => console.log('two'))
.then(_ => setTimeoutPromise(2000))
.then(_ => {throw new Error('test error')})
.catch(err => console.log('error caught:'))
.then(_ => console.log('hi'))
