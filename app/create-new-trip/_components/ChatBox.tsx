"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { Loader, Send } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import EmptyBoxState from './EmptyBoxState'
import GroupSizeUi from './GroupSizeUi'
import BudgetUi from './BudgetUi'
import SelectDays from './SelectDays'
import FinalUi from './FinalUi'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUserDetail } from '@/app/provider'
import { v4 as uuidv4 } from 'uuid';
import { CreateTripDetail } from '@/convex/tripDetail'

type Messages={
    role:string,
    content:string,
    ui?:string,
}

export type TripInfo={
    budget: string,
    destinatiom: String,
    duration: string,
    group_size: string,
    origin: string,
    hotels: any,
    itinerary: any
}

function ChatBox() {

    const [messages,setMessages]=useState<Messages[]>([]);
    const [userInput,SetUserInput]=useState<string>();
    const [loading,setLoading]=useState(false);
    const [isFinal,setIsFinal]=useState(false);
    const [tripDetail,setTripDetail]=useState<TripInfo>()
    const SaveTripDetail=useMutation(api.tripDetail.CreateTripDetail)
    const {userDetail,setUserDetail}=useUserDetail();

    const onSend = async()=>{
        if(!userInput?.trim()) return; 

        setLoading(true);
        SetUserInput('');
        const newMsg:Messages={
            role:'user',
            content:userInput ?? ''

        }
        setMessages((prev:Messages[])=>[...prev,newMsg]);

        const result = await axios.post('/api/aimodel',{
            messages:[...messages, newMsg],
            isFinal: isFinal
        });

        console.log("Trip", result.data);

        

        !isFinal && setMessages((prev:Messages[])=>[...prev, {
            role:'assistant',
            content:result?.data?.resp,
            ui:result?.data?.ui
        }]);

        if(isFinal)
        {
            setTripDetail(result?.data?.trip_plan);
            const tripId = uuidv4();
            await SaveTripDetail({
                tripDetail:result?.data?.trip_plan,
                tripId: tripId,
                uid: userDetail?._id 
            });
        }

        setLoading(false);
    }

    const RenderGenerativeUi=(ui:string)=>{
        if(ui=='budget')
        {
            //Budget UI Component
             return <BudgetUi onSelectedOption={(v:string)=>{SetUserInput(v); onSend()}}/>
        }else if(ui=='groupSize')
        {
            //Group Size UI Component
            return <GroupSizeUi onSelectedOption={(v:string)=>{SetUserInput(v); onSend()}}/>
        }else if (ui == 'tripDuration')
        {
            //Trip Duration UI component
            return <SelectDays onSelectedOption={(v:string)=>{SetUserInput(v); onSend()}}/>
        }else if (ui == 'final')
        {
            //final UI component
            return <FinalUi viewTrip={() => console.log()} 
            disable={!tripDetail}/>
        }
        return null
    }

    useEffect(() =>{
        const lastMsg=messages[messages.length-1];
        if(lastMsg?.ui=='final')
        {
            setIsFinal(true);
            SetUserInput('ok, Great!')
           
        }
    }, [messages])

    useEffect(() =>{
        if (isFinal && userInput) {
            onSend();
        }
    },[isFinal]);
    


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
                            {RenderGenerativeUi(msg.ui??'')}
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