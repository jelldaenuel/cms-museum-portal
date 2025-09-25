/* eslint-disable @typescript-eslint/no-explicit-any */
import EventItem from "@/components/event-item"
import Eyebrow from "@/components/eyebrow"
import supabase from "@/lib/supabase"
import { useQuery } from "@tanstack/react-query"

interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  icon?: string
  // Add other event properties as needed
}

const UpcomingEvents = () => {

    const { data: events, isLoading, error } = useQuery<Event[]>({
      queryKey: ['events'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('eventDate', { ascending: true })
          .limit(3) // Limit to 3 latest events
        
        if (error) {
          throw new Error(error.message)
        }
        return data || []
      },
    })

    if (isLoading) {
      return (
        <div className="container mx-auto">
          <div className="flex flex-col md:gap-20 gap-10 lg:py-20 md:py-16 py-12 px-5">
            <div className="text-center">Loading events...</div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="container mx-auto">
          <div className="flex flex-col md:gap-20 gap-10 lg:py-20 md:py-16 py-12 px-5">
            <div className="text-center text-red-500">Error loading events</div>
          </div>
        </div>
      )
    }
  
    
  return (
    <div>
      <div className="container mx-auto">
        <div className="flex flex-col md:gap-20 gap-10 lg:py-20 md:py-16 py-12 px-5">
          <div className="grid lg:grid-cols-12 grid-cols-1 gap-8">
            <div className="lg:col-span-8">
              <Eyebrow label="Upcoming Events" />
              <h2 className="font-display md:text-display-xl text-display-md pt-5 text-[#492309]">
                What's On in Rizal: Upcoming <span className="bg-[#927B6B]/95 text-gray-300 italic px-2">Museum Events</span>.
              </h2>
            </div>
          </div>
          <div className="flex lg:flex-row flex-col gap-8">
            {events && events.length > 0 ? (
              events.map((event) => (
                <EventItem
                  key={event.id}
                  date={event.eventDate}
                  icon={(event as any).coverPhoto || "/mock/hinge.png"} // Fallback to default icon
                  title={event.title}
                  description={event.description}
                />
              ))
            ) : (
              <div className="text-center w-full">
                <p className="text-gray-500">No upcoming events available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpcomingEvents
