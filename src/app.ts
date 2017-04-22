import PromiseNishant from './promise'

const setTimeoutPromise = (time: number) => 
	new PromiseNishant((resolve, reject) => setTimeout(_ => resolve(), time))

setTimeoutPromise(1000)
.then(_ => {console.log('start: 1'); return 1})
.then(x => {console.log('got', x, 'ret', 2); return 2})
.then(_ => setTimeoutPromise(0))
.then(_ => {throw new Error('test error')})
.then(x => {console.log('got', x, 'ret', 3); return 3})
.catch(err => console.log('error caught:'))
.then(x => {console.log('got', x, 'ret', 4); return 4})
.then()
.then(x => {console.log('got', x, 'ret', 5); return 5})
