

// // Inside Settings component
// <button 
//   onClick={() => toast('Settings Updated!', { icon: '⚙️' })}
//   className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
// >
//   Test Notification
// </button>
import React from 'react'
import toast from 'react-hot-toast';
function Setting() {
  return (
    <div> 
      <button 
  onClick={() => toast('Settings Updated!', { icon: '⚙️' })}
  className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
>
  Test Notification
</button>
</div>
  )
}

export default Setting