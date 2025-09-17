"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { Loader, Send } from 'lucide-react'
import React, { useState } from 'react'
import EmptyBoxState from './EmptyBoxState'

type Messages={
    role:string,
    content:string
}

function ChatBox() {

    const [messages,setmessages]=useState<Messages[]>([]);
    const [userInput,SetUserInput]=useState<string>();
    const [loading,setLoading]=useState(false);
    const onSend = async()=>{
        if(!userInput?.trim()) return;

        setLoading(true);
        SetUserInput('');
        const newMsg:Messages={
            role:'user',
            content:userInput

        }
        setmessages((prev:Messages[])=>[...prev,newMsg]);

        const result = await axios.post('/api/aimodel',{
            messages:[...messages,newMsg]
        });

        setmessages((prev:Messages[])=>[...prev,{
            role:'assistant',
            content:result?.data?.resp
        }]);
        console.log(result.data);
        setLoading(false);
    }

  return (
    <div className='h-[85vh] flex flex-col'>
        {messages?.length==0&&
            <EmptyBoxState 
            onSelectOption={(v:string)=>{SetUserInput(v); onSend()}}/>
        }
        {/* Display Messages */}
        <section className='flex-1 overflow-y-auto p-4'>
            {messages.map((msg:Messages, index)=>(
                msg.role=='user'?
                        <div className='flex justify-end mt-5' key={index}>
                        <div className='max-w-lg bg-primary text-white px-4 py-2 rounded-lg'>
                            {msg.content}
                        </div>
                    </div>:
                    <div className='flex justify-start mt-2' key={index}>
                        <div className='max-w-lg bg-gray-100 text-black px-4 py-2 rounded-lg'>
                            { msg.content}
                        </div>
                    </div>
            ))}
            {loading&& <div className='flex justify-start mt-2' >
                        <div className='max-w-lg bg-gray-100 text-black px-4 py-2 rounded-lg'>
                           <Loader className='animate-spin'/>
                        </div>
                    </div>}
        </section>
        {/* User Input */}
        <section>
           <div className="border rounded-2xl p-4 relative">
                     <Textarea placeholder="Start typing here..." 
                     className='w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none'
                     onChange={(event) => SetUserInput(event.target.value)}
                     value={userInput}
                     />
                     <Button size={'icon'} className='absolute bottom-6 right-6' onClick={()=>onSend()}>
                       <Send className='h-4 w-4'/>
                     </Button>
                     
                   </div>
        </section>
    </div>
  )
}

export default ChatBox