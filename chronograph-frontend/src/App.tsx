import { useState } from 'react'
import './App.css'
import ChatComponent from './ChatComponent'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ChatComponent />
    </>
  )
}

export default App
